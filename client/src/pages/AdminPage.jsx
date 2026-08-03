import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  MapPin,
  UtensilsCrossed,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Building,
  Lock,
  KeyRound,
  User,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';

const canteenStatusLabel = {
  available: 'Available',
  limited: 'Limited',
  soldOut: 'Sold out',
};

export default function AdminPage() {
  // Password protection state
  const [isAdminAuth, setIsAdminAuth] = useState(() => {
    return sessionStorage.getItem('admin_portal_auth') === 'true';
  });
  const [adminIdInput, setAdminIdInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('locations'); // 'locations' | 'canteen'
  const [locations, setLocations] = useState([]);
  const [canteenItems, setCanteenItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New location form state
  const [newLocation, setNewLocation] = useState({
    name: '',
    type: 'classroom',
    building: '',
    floor: 1,
    coordinates: { x: 50, y: 50 },
  });

  // New canteen item form state
  const [newCanteenItem, setNewCanteenItem] = useState({
    name: '',
    category: 'Snacks',
    price: '',
    status: 'available',
  });

  // Handle Admin Portal login
  const handleAdminLogin = async (e) => {
    e.preventDefault();

    const isValidAdminCredentials =
      adminIdInput.trim() === 'admin' && adminPasswordInput === 'admin@12345';

    if (!isValidAdminCredentials) {
      setAuthError('Invalid Admin ID or Password');
      toast.error('Invalid credentials');
      return;
    }

    // Immediately grant local admin access
    sessionStorage.setItem('admin_portal_auth', 'true');
    setIsAdminAuth(true);
    setAuthError('');
    toast.success('Admin portal access granted');

    // Optionally sign into Supabase (non-blocking) if real admin env vars are configured
    const adminEmail = import.meta.env.VITE_SUPABASE_ADMIN_EMAIL || '';
    const adminPassword = import.meta.env.VITE_SUPABASE_ADMIN_PASSWORD || '';
    const hasRealAdminCredentials =
      Boolean(adminEmail) &&
      Boolean(adminPassword) &&
      !adminEmail.includes('example.com') &&
      !adminPassword.includes('your-');

    if (hasRealAdminCredentials) {
      api.signInAdmin(adminEmail, adminPassword)
        .then(({ error }) => {
          if (error) {
            console.warn('Supabase admin sign-in failed (non-blocking):', error);
          }
        })
        .catch((err) => console.warn('Supabase admin sign-in error (non-blocking):', err));
    }
  };

  // Handle Admin Portal logout / re-lock
  const handleAdminLogout = async () => {
    await api.signOutAdmin();
    sessionStorage.removeItem('admin_portal_auth');
    setIsAdminAuth(false);
    setAdminIdInput('');
    setAdminPasswordInput('');
    toast.success('Admin session locked');
  };

  const fetchData = async () => {
    if (!isAdminAuth) return;
    setLoading(true);
    try {
      const [locRes, canteenRes] = await Promise.allSettled([
        api.get('/locations'),
        api.get('/canteen-items'),
      ]);

      if (locRes.status === 'fulfilled') {
        const data = locRes.value.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.locations)
          ? data.locations
          : [];
        setLocations(list);
      } else {
        setLocations([]);
      }

      if (canteenRes.status === 'fulfilled') {
        const data = canteenRes.value.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : [];
        setCanteenItems(list);
      } else {
        setCanteenItems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdminAuth]);

  // If not authenticated, render password lock screen
  if (!isAdminAuth) {
    return (
      <div className="admin-page flex min-h-[70vh] items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface flat-card admin-lock-card w-full max-w-md"
        >
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon admin-lock-icon text-accent" aria-hidden="true">
                <Lock size={16} strokeWidth={1.8} />
              </span>
              <h2 className="card-title">Admin Portal Access</h2>
            </div>
          </div>
          <div className="card-body">
            <p className="text-sm text-foreground-muted">
              Enter your credentials to unlock campus management tools.
            </p>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-3">
            {authError && (
              <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 p-3 text-xs font-semibold text-error">
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label htmlFor="admin-id" className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Admin ID
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  id="admin-id"
                  type="text"
                  placeholder="Enter ID"
                  value={adminIdInput}
                  onChange={(e) => {
                    setAdminIdInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-foreground-muted mb-2">
                Password
              </label>
              <div className="relative">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <input
                  id="admin-password"
                  type="password"
                  placeholder="Enter Password"
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full py-3.5 text-sm font-bold mt-2">
              Authenticate Portal
            </Button>
          </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Safe arrays
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeCanteenItems = Array.isArray(canteenItems) ? canteenItems : [];

  // Add location handler
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.building) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      const res = await api.post('/locations', newLocation);
      setLocations((prev) => (Array.isArray(prev) ? [...prev, res.data] : [res.data]));
      toast.success(`Location "${newLocation.name}" created!`);
      setNewLocation({
        name: '',
        type: 'classroom',
        building: '',
        floor: 1,
        coordinates: { x: 50, y: 50 },
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add location');
    }
  };

  // Delete location handler
  const handleDeleteLocation = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/locations/${id}`);
      setLocations((prev) => (Array.isArray(prev) ? prev.filter((l) => l._id !== id) : []));
      toast.success(`Location "${name}" removed.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete location');
    }
  };

  // Add canteen item handler
  const handleAddCanteenItem = async (e) => {
    e.preventDefault();
    if (!newCanteenItem.name || !newCanteenItem.price) {
      toast.error('Please enter name and price');
      return;
    }
    try {
      const res = await api.post('/canteen-items', {
        ...newCanteenItem,
        price: parseFloat(newCanteenItem.price),
      });
      setCanteenItems((prev) => (Array.isArray(prev) ? [...prev, res.data] : [res.data]));
      toast.success(`Canteen item "${newCanteenItem.name}" added!`);
      setNewCanteenItem({
        name: '',
        category: 'Snacks',
        price: '',
        status: 'available',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add canteen item');
    }
  };

  // Toggle canteen status
  const handleToggleCanteenStatus = async (id, currentStatus) => {
    const nextStatusMap = {
      available: 'limited',
      limited: 'soldOut',
      soldOut: 'available',
    };
    const nextStatus = nextStatusMap[currentStatus] || 'available';

    try {
      await api.patch(`/canteen-items/${id}/toggle-status`, { status: nextStatus });
      setCanteenItems((prev) =>
        Array.isArray(prev)
          ? prev.map((item) => (item._id === id ? { ...item, status: nextStatus } : item))
          : []
      );
      toast.success('Status updated!');
    } catch (err) {
      toast.error('Failed to update item status');
    }
  };

  // Delete canteen item
  const handleDeleteCanteenItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    try {
      await api.delete(`/canteen-items/${id}`);
      setCanteenItems((prev) => (Array.isArray(prev) ? prev.filter((item) => item._id !== id) : []));
      toast.success(`"${name}" removed from menu.`);
    } catch (err) {
      toast.error('Failed to delete item');
    }
  };

  const filteredLocations = safeLocations.filter(
    (l) =>
      l?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l?.building?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l?.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page space-y-10 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          icon={ShieldCheck}
          eyebrow="Admin Dashboard"
          title="Campus Control Panel"
          description="Manage campus locations, map markers, canteen live menu items, and view system status."
        />
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-surface flat-card admin-metric">
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true"><MapPin size={16} strokeWidth={1.8} /></span>
              <span className="card-title">Locations mapped</span>
            </div>
          </div>
          <div className="card-data-item">
            <span className="card-label">Verified campus points</span>
            <span className="card-value">{safeLocations.length}</span>
          </div>
        </div>

        <div className="card-surface flat-card admin-metric">
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true"><UtensilsCrossed size={16} strokeWidth={1.8} /></span>
              <span className="card-title">Canteen items</span>
            </div>
          </div>
          <div className="card-data-item">
            <span className="card-label">Live menu items</span>
            <span className="card-value">{safeCanteenItems.length}</span>
          </div>
        </div>

        <div className="card-surface flat-card admin-metric">
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true"><Building size={16} strokeWidth={1.8} /></span>
              <span className="card-title">Buildings covered</span>
            </div>
          </div>
          <div className="card-data-item">
            <span className="card-label">Unique campus structures</span>
            <span className="card-value">{new Set(safeLocations.map((l) => l?.building).filter(Boolean)).size || 0}</span>
          </div>
        </div>

        <div className="card-surface flat-card admin-metric">
          <div className="card-header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true"><ShieldCheck size={16} strokeWidth={1.8} /></span>
              <span className="card-title">System health</span>
            </div>
            <Badge status="available">Operational</Badge>
          </div>
          <div className="card-data-item">
            <span className="card-label">Sync rate</span>
            <span className="card-value">100%</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="admin-tabs flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('locations')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'locations'
                ? 'admin-tab-active bg-accent text-white shadow-glow'
                : 'border border-border/50 bg-surface-secondary/40 text-foreground-muted hover:text-foreground'
            }`}
          >
            <MapPin size={16} />
            Locations ({safeLocations.length})
          </button>

          <button
            onClick={() => setActiveTab('canteen')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'canteen'
                ? 'admin-tab-active bg-accent text-white shadow-glow'
                : 'border border-border/50 bg-surface-secondary/40 text-foreground-muted hover:text-foreground'
            }`}
          >
            <UtensilsCrossed size={16} />
            Canteen Menu ({safeCanteenItems.length})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={fetchData}
            className="!py-2 !px-4 text-xs"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <button
            onClick={handleAdminLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-error/30 bg-error/10 px-3.5 py-2 text-xs font-semibold text-error hover:bg-error/20 transition"
            title="Lock Admin Session"
          >
            <LogOut size={14} />
            Lock Portal
          </button>
        </div>
      </div>

      {/* TAB 1: LOCATIONS MANAGEMENT */}
      {activeTab === 'locations' && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Add Location Form */}
          <div className="card-surface flat-card admin-form-card lg:col-span-1 h-fit">
            <div className="card-header">
              <div className="card-header__main">
                <span className="card-header__icon" aria-hidden="true"><Plus size={16} strokeWidth={1.8} /></span>
                <span className="card-title">Add new location</span>
              </div>
            </div>

            <form onSubmit={handleAddLocation} className="card-body text-sm">
              <div>
                <label className="block font-medium text-foreground-muted mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics Lab 102"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground-muted mb-1">
                    Building *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Science Block"
                    value={newLocation.building}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, building: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground-muted mb-1">Floor</label>
                  <input
                    type="number"
                    value={newLocation.floor}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, floor: parseInt(e.target.value) || 0 })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground-muted mb-1">Type</label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                  className="input-field"
                >
                  <option value="classroom">Classroom</option>
                  <option value="lab">Lab</option>
                  <option value="faculty">Faculty Room</option>
                  <option value="canteen">Canteen</option>
                  <option value="washroom">Washroom</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Button type="submit" className="w-full mt-2">
                Create Location
              </Button>
            </form>
          </div>

          {/* Locations Table/List */}
          <div className="space-y-4 lg:col-span-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
              />
              <input
                type="text"
                placeholder="Search locations by name, building, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11"
              />
            </div>

            <div className="card-surface admin-list flex flex-col gap-3">
              <div className="card-header">
                <div className="card-header__main">
                  <span className="card-header__icon" aria-hidden="true"><MapPin size={16} strokeWidth={1.8} /></span>
                  <span className="card-title">Mapped locations</span>
                </div>
              </div>
              {filteredLocations.length === 0 ? (
                <div className="p-4 text-center text-sm text-foreground-muted">
                  No locations found matching your filter.
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <div
                    key={location._id}
                    className="card-surface admin-list-row flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="card-header__main">
                      <span className="card-header__icon text-accent" aria-hidden="true">
                        <MapPin size={16} strokeWidth={1.8} />
                      </span>
                      <div className="card-data-item">
                        <h4 className="card-title">{location.name}</h4>
                        <div className="card-meta-row">
                          <span className="card-label">Building</span>
                          <span>{location.building || 'Unassigned'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="card-label">Floor</span>
                          <span>{location.floor ?? '—'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="card-label">Type</span>
                          <span>{location.type || 'Other'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="card-data-item">
                        <span className="card-label">Coordinates</span>
                        <span className="card-value text-sm">({location.coordinates?.x || 0}, {location.coordinates?.y || 0})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteLocation(location._id, location.name)}
                        className="rounded-xl border border-error/30 p-2 text-error hover:bg-error/10 transition"
                        title="Delete Location"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANTEEN MENU MANAGEMENT */}
      {activeTab === 'canteen' && (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Add Canteen Item Form */}
          <div className="card-surface flat-card admin-form-card lg:col-span-1 h-fit">
            <div className="card-header">
              <div className="card-header__main">
                <span className="card-header__icon" aria-hidden="true"><Plus size={16} strokeWidth={1.8} /></span>
                <span className="card-title">Add canteen item</span>
              </div>
            </div>

            <form onSubmit={handleAddCanteenItem} className="card-body text-sm">
              <div>
                <label className="block font-medium text-foreground-muted mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Veg Burger, Masala Dosa"
                  value={newCanteenItem.name}
                  onChange={(e) => setNewCanteenItem({ ...newCanteenItem, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-foreground-muted mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="50"
                    value={newCanteenItem.price}
                    onChange={(e) => setNewCanteenItem({ ...newCanteenItem, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground-muted mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="Snacks, Drinks, Meal"
                    value={newCanteenItem.category}
                    onChange={(e) =>
                      setNewCanteenItem({ ...newCanteenItem, category: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-foreground-muted mb-1">Initial Status</label>
                <select
                  value={newCanteenItem.status}
                  onChange={(e) => setNewCanteenItem({ ...newCanteenItem, status: e.target.value })}
                  className="input-field"
                >
                  <option value="available">Available</option>
                  <option value="limited">Limited</option>
                  <option value="soldOut">Sold Out</option>
                </select>
              </div>

              <Button type="submit" className="w-full mt-2">
                Add To Menu
              </Button>
            </form>
          </div>

          {/* Canteen List */}
          <div className="space-y-4 lg:col-span-2">
            <div className="card-surface admin-list flex flex-col gap-3">
              <div className="card-header">
                <div className="card-header__main">
                  <span className="card-header__icon" aria-hidden="true"><UtensilsCrossed size={16} strokeWidth={1.8} /></span>
                  <span className="card-title">Live canteen menu</span>
                </div>
              </div>
              {safeCanteenItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-foreground-muted">
                  No menu items found. Add your first item using the form.
                </div>
              ) : (
                safeCanteenItems.map((item) => (
                  <div
                    key={item._id}
                    className="card-surface admin-list-row flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="card-header__main">
                      <span className="card-header__icon text-accent" aria-hidden="true">
                        <UtensilsCrossed size={16} strokeWidth={1.8} />
                      </span>
                      <div className="card-data-item">
                        <h4 className="card-title">{item.name}</h4>
                        <div className="card-meta-row">
                          <span className="card-label">Category</span>
                          <span>{item.category || 'Campus menu'}</span>
                          <span aria-hidden="true">·</span>
                          <span className="card-label">Price</span>
                          <span className="font-semibold text-foreground">₹{item.price}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleCanteenStatus(item._id, item.status)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge status={item.status}>{canteenStatusLabel[item.status] || 'Available'}</Badge>
                      </button>

                      <button
                        onClick={() => handleDeleteCanteenItem(item._id, item.name)}
                        className="rounded-xl border border-error/30 p-2 text-error hover:bg-error/10 transition"
                        title="Delete Item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
