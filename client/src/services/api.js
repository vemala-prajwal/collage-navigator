import { supabase } from '../lib/supabaseClient';

const normalizeRecord = (row) => {
  if (!row) return row;
  const { id, ...rest } = row;
  return { ...rest, id, _id: row._id || row.id };
};

const normalizeList = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeRecord);
};

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your client environment.'
    );
  }
};

const getAdminCredentials = () => ({
  email: import.meta.env.VITE_SUPABASE_ADMIN_EMAIL || '',
  password: import.meta.env.VITE_SUPABASE_ADMIN_PASSWORD || '',
});

const ensureAdminAuthSession = async () => {
  if (!supabase) {
    return false;
  }

  const { email, password } = getAdminCredentials();
  if (!email || !password) {
    return false;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return true;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }

  return true;
};

const assertAdminWriteAccess = async () => {
  if (typeof window !== 'undefined' && window.sessionStorage.getItem('admin_portal_auth') !== 'true') {
    throw new Error('Only the admin portal can edit campus data.');
  }

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { email, password } = getAdminCredentials();
  if (email && password) {
    await ensureAdminAuthSession();
  }
};

const getTableAndId = (path) => {
  const cleanPath = path.replace(/^\/+/, '').split('?')[0];
  const parts = cleanPath.split('/');

  if (parts[0] === 'locations') {
    return { table: 'locations', id: parts[1] || null };
  }

  if (parts[0] === 'canteen-items') {
    return { table: 'canteen_items', id: parts[1] || null };
  }

  if (parts[0] === 'feedback') {
    return { table: 'feedback', id: parts[1] || null };
  }

  return { table: null, id: null };
};

const api = {
  async get(path, options = {}) {
    try {
      ensureSupabase();
      const { params = {} } = options;
      const { table, id } = getTableAndId(path);

      if (!table) {
        return { data: [] };
      }

      if (table === 'locations' && id) {
        const [locationRes, feedbackRes] = await Promise.all([
          supabase.from('locations').select('*').eq('id', id).maybeSingle(),
          supabase.from('feedback').select('*').eq('target_type', 'location').eq('target_id', id).order('created_at', { ascending: false }),
        ]);

        if (locationRes.error) throw locationRes.error;
        const feedbacks = normalizeList(feedbackRes.data || []);
        const averageRating = feedbacks.length
          ? (feedbacks.reduce((sum, item) => sum + (item.rating || 0), 0) / feedbacks.length).toFixed(1)
          : '0.0';

        return {
          data: {
            location: normalizeRecord(locationRes.data),
            averageRating,
            feedbacks,
          },
        };
      }

      let query = supabase.from(table).select('*');

      if (table === 'locations') {
        if (params.query) {
          query = query.or(`name.ilike.%${params.query}%,building.ilike.%${params.query}%`);
        }
        if (params.type) {
          query = query.eq('type', params.type);
        }
        if (params.building) {
          query = query.ilike('building', `%${params.building}%`);
        }
        query = query.order('created_at', { ascending: false });
      }

      if (table === 'canteen_items') {
        query = query.order('updated_at', { ascending: false });
      }

      if (table === 'feedback') {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data: normalizeList(data || []) };
    } catch (error) {
      console.error(error);
      return { data: [] };
    }
  },

  async post(path, payload) {
    try {
      ensureSupabase();
      await assertAdminWriteAccess();
      const { table } = getTableAndId(path);

      if (table === 'locations') {
        const { data, error } = await supabase
          .from('locations')
          .insert([{ ...payload, status: payload.status || 'available' }])
          .select('*')
          .single();
        if (error) throw error;
        return { data: normalizeRecord(data) };
      }

      if (table === 'canteen_items') {
        const { data, error } = await supabase
          .from('canteen_items')
          .insert([
            {
              ...payload,
              price: Number(payload.price),
              status: payload.status || 'available',
              category: payload.category || 'Snacks',
            },
          ])
          .select('*')
          .single();
        if (error) throw error;
        return { data: normalizeRecord(data) };
      }

      if (table === 'feedback') {
        const { data, error } = await supabase
          .from('feedback')
          .insert([
            {
              target_type: payload.targetType,
              target_id: payload.targetId,
              rating: payload.rating,
              comment: payload.comment,
              user_name: payload.userName || 'Anonymous',
            },
          ])
          .select('*')
          .single();
        if (error) throw error;
        return { data: normalizeRecord(data) };
      }

      return { data: null };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async patch(path, payload) {
    try {
      ensureSupabase();
      await assertAdminWriteAccess();
      const { table, id } = getTableAndId(path);

      if (table === 'canteen_items' && id) {
        const current = await supabase.from('canteen_items').select('*').eq('id', id).maybeSingle();
        if (current.error) throw current.error;

        const statuses = ['available', 'limited', 'soldOut'];
        const nextStatus = payload.status || statuses[(statuses.indexOf(current.data?.status || 'available') + 1) % statuses.length];
        const { data, error } = await supabase
          .from('canteen_items')
          .update({ status: nextStatus, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('*')
          .single();
        if (error) throw error;
        return { data: normalizeRecord(data) };
      }

      return { data: null };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async put(path, payload) {
    try {
      ensureSupabase();
      await assertAdminWriteAccess();
      const { table, id } = getTableAndId(path);
      if (!table || !id) return { data: null };

      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select('*').single();
      if (error) throw error;
      return { data: normalizeRecord(data) };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async delete(path) {
    try {
      ensureSupabase();
      await assertAdminWriteAccess();
      const { table, id } = getTableAndId(path);
      if (!table || !id) return { data: { success: true } };

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return { data: { success: true } };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  subscribe(table, callback) {
    if (!supabase) {
      return { unsubscribe: () => {} };
    }

    const channel = supabase.channel(`${table}-changes`);
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, callback).subscribe();
    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      },
    };
  },

  async signInAdmin(email, password) {
    if (!supabase) {
      return { data: { user: null }, error: null };
    }
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOutAdmin() {
    if (!supabase) {
      return { error: null };
    }
    return supabase.auth.signOut();
  },
};

export default api;
