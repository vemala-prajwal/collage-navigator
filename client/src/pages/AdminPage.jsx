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
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminIdInput.trim() === 'admin' && adminPasswordInput === 'admin@12345') {
      sessionStorage.setItem('admin_portal_auth', 'true');
      setIsAdminAuth(true);
      setAuthError('');
      toast.success('Admin portal access granted');
    } else {
      setAuthError('Invalid Admin ID or Password');
      toast.error('Invalid credentials');
    }
  };

  // Handle Admin Portal logout / re-lock
  const handleAdminLogout = () => {
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
      <div className="flex min-h-[70vh] items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flat-card w-full max-w-md p-8 sm:p-10 shadow-elevated"
        >
          <div className="flex flex-col items-center text-center">
            <div className="icon-well text-accent mb-4 p-4 rounded-2xl bg-accent/10 border-accent/20">
              <Lock size={32} />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">Admin Portal Access</h2>
            <p className="mt-2 text-sm text-foreground-muted">
              Enter your credentials to unlock campus management tools.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="mt-8 space-y-5">
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
    <div className="space-y-10 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          eyebrow="Admin Dashboard"
          title="Campus Control Panel"
          description="Manage campus locations, map markers, canteen live menu items, and view system status."
        />
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flat-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Locations Mapped
            </span>
            <div className="icon-well text-accent">
              <MapPin size={18} />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-foreground">
            {safeLocations.length}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">Verified campus points</p>
        </div>

        <div className="flat-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Canteen Items
            </span>
            <div className="icon-well text-accent2">
              <UtensilsCrossed size={18} />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-foreground">
            {safeCanteenItems.length}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">Live menu items</p>
        </div>

        <div className="flat-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Buildings Covered
            </span>
            <div className="icon-well text-success">
              <Building size={18} />
            </div>
          </div>
          <p className="mt-4 font-display text-3xl font-bold text-foreground">
            {new Set(safeLocations.map((l) => l?.building).filter(Boolean)).size || 0}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">Unique campus structures</p>
        </div>

        <div className="flat-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              System Health
            </span>
            <div className="icon-well text-emerald-400">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-display text-xl font-bold text-emerald-500">Operational</span>
          </div>
          <p className="mt-1 text-xs text-foreground-muted">100% sync rate</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('locations')}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === 'locations'
                ? 'bg-accent text-white shadow-glow'
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
                ? 'bg-accent text-white shadow-glow'
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
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add Location Form */}
          <div className="flat-card p-6 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 text-accent font-bold text-lg mb-4">
              <Plus size={20} />
              <span>Add New Location</span>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4 text-sm">
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

            <div className="divide-y divide-border/40 rounded-2xl border border-border/50 bg-surface/60 backdrop-blur-md overflow-hidden">
              {filteredLocations.length === 0 ? (
                <div className="p-8 text-center text-foreground-muted">
                  No locations found matching your filter.
                </div>
              ) : (
                filteredLocations.map((location) => (
                  <div
                    key={location._id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-surface-secondary/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="icon-well text-accent shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-foreground">
                          {location.name}
                        </h4>
                        <p className="text-xs text-foreground-muted">
                          {location.building} · Floor {location.floor} · Type: {location.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-surface-secondary px-2.5 py-1 text-xs font-semibold text-foreground-muted border border-border/40">
                        ({location.coordinates?.x || 0}, {location.coordinates?.y || 0})
                      </span>
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
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add Canteen Item Form */}
          <div className="flat-card p-6 lg:col-span-1 h-fit">
            <div className="flex items-center gap-2 text-accent2 font-bold text-lg mb-4">
              <Plus size={20} />
              <span>Add Canteen Item</span>
            </div>

            <form onSubmit={handleAddCanteenItem} className="space-y-4 text-sm">
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
            <div className="divide-y divide-border/40 rounded-2xl border border-border/50 bg-surface/60 backdrop-blur-md overflow-hidden">
              {safeCanteenItems.length === 0 ? (
                <div className="p-8 text-center text-foreground-muted">
                  No menu items found. Add your first item using the form.
                </div>
              ) : (
                safeCanteenItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-surface-secondary/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="icon-well text-accent2 shrink-0">
                        <UtensilsCrossed size={18} />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-foreground">{item.name}</h4>
                        <p className="text-xs text-foreground-muted">
                          {item.category} · <span className="font-bold text-foreground">₹{item.price}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleCanteenStatus(item._id, item.status)}
                        className="cursor-pointer"
                        title="Click to toggle status"
                      >
                        <Badge status={item.status}>{item.status}</Badge>
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
