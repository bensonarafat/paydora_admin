'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Receipt,
  Tags,
  Store,
  Package,
  Search,
  Check,
  X,
  Edit2,
  Plus,
  Sparkles,
  Percent,
  Calendar,
  Upload,
  Globe,
  Zap,
  Phone,
  Wifi,
  Tv,
  Gamepad2,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { 
  BillCategoryConfigItem, 
  StandardBillerItem, 
  BillerProductItem, 
  BillsSubTab 
} from '@/types/admin';

interface BillsManagementViewProps {
  categories: BillCategoryConfigItem[];
  billers: StandardBillerItem[];
  products: BillerProductItem[];
  activeSubTab: BillsSubTab;
  onSubTabChange: (tab: BillsSubTab) => void;
  onUpdateCategory: (id: string, updates: Partial<BillCategoryConfigItem>) => Promise<void>;
  onCreateCategory: (data: Omit<BillCategoryConfigItem, 'id'>) => Promise<void>;
  onUpdateBiller: (id: string, updates: Partial<StandardBillerItem>) => Promise<void>;
  onCreateBiller: (data: Omit<StandardBillerItem, 'id'>) => Promise<void>;
  onDeleteBiller?: (id: string) => Promise<void>;
  onUpdateProduct: (id: string, updates: Partial<BillerProductItem>) => Promise<void>;
  onCreateProduct: (data: Omit<BillerProductItem, 'id'>) => Promise<void>;
  isLoading: boolean;
}

const COMMON_ICON_PATHS = [
  'assets/icons/bills/airtime.svg',
  'assets/icons/bills/data.svg',
  'assets/icons/bills/electricity.svg',
  'assets/icons/bills/cable_tv.svg',
  'assets/icons/bills/internet.svg',
  'assets/icons/bills/betting.svg',
  'assets/icons/bills/education.svg',
  'assets/icons/bills/transport.svg',
];

export default function BillsManagementView({
  categories,
  billers,
  products,
  activeSubTab,
  onSubTabChange,
  onUpdateCategory,
  onCreateCategory,
  onUpdateBiller,
  onCreateBiller,
  onDeleteBiller,
  onUpdateProduct,
  onCreateProduct,
  isLoading,
}: BillsManagementViewProps) {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'DISABLED'>('ALL');
  const [hotFilter, setHotFilter] = useState<'ALL' | 'HOT_ONLY'>('ALL');

  // Modal Editing & Creating States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BillCategoryConfigItem | null>(null);

  const [isBillerModalOpen, setIsBillerModalOpen] = useState(false);
  const [isEditingBiller, setIsEditingBiller] = useState(false);
  const [selectedBiller, setSelectedBiller] = useState<StandardBillerItem | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BillerProductItem | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // Category Form State
  const [catLabel, setCatLabel] = useState('');
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catSection, setCatSection] = useState('Telecom');
  const [catCashback, setCatCashback] = useState(0);
  const [catProvider, setCatProvider] = useState('squad');
  const [catOrder, setCatOrder] = useState(1);
  const [catIconPath, setCatIconPath] = useState('assets/icons/bills/airtime.svg');
  const [catReqValidation, setCatReqValidation] = useState(false);
  const [catFeature, setCatFeature] = useState(true);
  const [catAvailable, setCatAvailable] = useState(true);
  const [catHot, setCatHot] = useState(false);

  // Biller Form State
  const [billerName, setBillerName] = useState('');
  const [billerShortName, setBillerShortName] = useState('');
  const [billerCode, setBillerCode] = useState('');
  const [billerCategoryId, setBillerCategoryId] = useState('');
  const [billerProvider, setBillerProvider] = useState('squad');
  const [billerCashback, setBillerCashback] = useState(0);
  const [billerLogo, setBillerLogo] = useState<string | null>(null);
  const [billerDescription, setBillerDescription] = useState('');
  const [billerAvailable, setBillerAvailable] = useState(true);
  const [billerHot, setBillerHot] = useState(false);
  const [billerUrlMode, setBillerUrlMode] = useState(false);
  const [billerUrlInput, setBillerUrlInput] = useState('');

  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodShortName, setProdShortName] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [prodBillerCode, setProdBillerCode] = useState('');
  const [prodIsVariable, setProdIsVariable] = useState(false);
  const [prodAmount, setProdAmount] = useState<number | ''>(1000);
  const [prodValidity, setProdValidity] = useState<number | ''>(30);
  const [prodProvider, setProdProvider] = useState('squad');
  const [prodAvailable, setProdAvailable] = useState(true);
  const [prodHot, setProdHot] = useState(false);

  const billerFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isModalOpen = isCategoryModalOpen || isBillerModalOpen || isProductModalOpen;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen && !isSaving) {
        closeModals();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isSaving]);

  const closeModals = () => {
    if (isSaving) return;
    setIsCategoryModalOpen(false);
    setIsEditingCategory(false);
    setSelectedCategory(null);

    setIsBillerModalOpen(false);
    setIsEditingBiller(false);
    setSelectedBiller(null);

    setIsProductModalOpen(false);
    setIsEditingProduct(false);
    setSelectedProduct(null);
  };

  // Open Create Category Modal
  const openCreateCategory = () => {
    setSelectedCategory(null);
    setIsEditingCategory(false);
    setCatLabel('');
    setCatName('');
    setCatCode('');
    setCatSection('Telecom');
    setCatCashback(1.5);
    setCatProvider('squad');
    setCatOrder(categories.length + 1);
    setCatIconPath('assets/icons/bills/airtime.svg');
    setCatReqValidation(false);
    setCatFeature(true);
    setCatAvailable(true);
    setCatHot(false);
    setIsCategoryModalOpen(true);
  };

  // Open Edit Category Modal
  const openEditCategory = (cat: BillCategoryConfigItem) => {
    setSelectedCategory(cat);
    setIsEditingCategory(true);
    setCatLabel(cat.label);
    setCatName(cat.category_name);
    setCatCode(cat.code);
    setCatSection(cat.section || 'Telecom');
    setCatCashback(Number(cat.cashback_percentage) || 0);
    setCatProvider(cat.provider || 'squad');
    setCatOrder(cat.order || 1);
    setCatIconPath(cat.icon || 'assets/icons/bills/airtime.svg');
    setCatReqValidation(cat.requires_validation);
    setCatFeature(cat.feature);
    setCatAvailable(cat.is_available);
    setCatHot(cat.is_hot);
    setIsCategoryModalOpen(true);
  };

  // Open Create Biller Modal
  const openCreateBiller = () => {
    setSelectedBiller(null);
    setIsEditingBiller(false);
    setBillerName('');
    setBillerShortName('');
    setBillerCode('');
    setBillerCategoryId(categories[0]?.id || '1');
    setBillerProvider('squad');
    setBillerCashback(1.5);
    setBillerLogo(null);
    setBillerDescription('');
    setBillerAvailable(true);
    setBillerHot(false);
    setBillerUrlMode(false);
    setBillerUrlInput('');
    setIsBillerModalOpen(true);
  };

  // Open Edit Biller Modal
  const openEditBiller = (b: StandardBillerItem) => {
    setSelectedBiller(b);
    setIsEditingBiller(true);
    setBillerName(b.name);
    setBillerShortName(b.short_name || '');
    setBillerCode(b.biller_code);
    setBillerCategoryId(b.category_id || (categories[0]?.id || '1'));
    setBillerProvider(b.provider || 'squad');
    setBillerCashback(Number(b.cashback_percentage) || 0);
    setBillerLogo(b.logo || null);
    setBillerDescription(b.description || '');
    setBillerAvailable(b.is_available);
    setBillerHot(b.is_hot);
    setBillerUrlMode(false);
    setBillerUrlInput(b.logo || '');
    setIsBillerModalOpen(true);
  };

  // Open Create Product Modal
  const openCreateProduct = () => {
    setSelectedProduct(null);
    setIsEditingProduct(false);
    setProdName('');
    setProdShortName('');
    setProdCode('');
    setProdBillerCode(billers[0]?.biller_code || 'MTN_VTU');
    setProdIsVariable(false);
    setProdAmount(1000);
    setProdValidity(30);
    setProdProvider('squad');
    setProdAvailable(true);
    setProdHot(false);
    setIsProductModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditProduct = (p: BillerProductItem) => {
    setSelectedProduct(p);
    setIsEditingProduct(true);
    setProdName(p.name);
    setProdShortName(p.short_name || '');
    setProdCode(p.product_code);
    setProdBillerCode(p.biller_code);
    setProdIsVariable(p.amount === null || p.amount === undefined);
    setProdAmount(p.amount !== null && p.amount !== undefined ? Number(p.amount) : '');
    setProdValidity(p.validity_days !== null && p.validity_days !== undefined ? Number(p.validity_days) : '');
    setProdProvider(p.provider || 'squad');
    setProdAvailable(p.is_available);
    setProdHot(p.is_hot);
    setIsProductModalOpen(true);
  };

  // Save Category Changes or Create New
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataPayload = {
        label: catLabel.trim(),
        category_name: catName.trim().toLowerCase(),
        code: catCode.trim().toUpperCase(),
        section: catSection.trim(),
        cashback_percentage: Number(catCashback) || 0,
        provider: catProvider,
        order: Number(catOrder) || 1,
        icon: catIconPath.trim(),
        requires_validation: catReqValidation,
        feature: catFeature,
        is_available: catAvailable,
        is_hot: catHot,
      };

      if (isEditingCategory && selectedCategory) {
        await onUpdateCategory(selectedCategory.id, dataPayload);
      } else {
        await onCreateCategory(dataPayload);
      }
      closeModals();
    } finally {
      setIsSaving(false);
    }
  };

  // Save Biller Changes or Create New
  const handleSaveBiller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billerName.trim()) {
      alert('Biller name is required.');
      return;
    }
    if (!billerCode.trim()) {
      alert('Biller code is required.');
      return;
    }
    if (!billerCategoryId) {
      alert('Please select a bill category.');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCat = categories.find((c) => c.id === billerCategoryId);
      const finalLogo = billerUrlMode && billerUrlInput.trim() ? billerUrlInput.trim() : billerLogo;

      const dataPayload = {
        name: billerName.trim(),
        short_name: billerShortName.trim() || undefined,
        biller_code: billerCode.trim().toUpperCase(),
        category_id: billerCategoryId,
        category_name: selectedCat?.label || selectedCat?.category_name,
        provider: billerProvider,
        cashback_percentage: Number(billerCashback) || 0,
        logo: finalLogo,
        description: billerDescription.trim() || undefined,
        is_available: billerAvailable,
        is_hot: billerHot,
      };

      if (isEditingBiller && selectedBiller) {
        await onUpdateBiller(selectedBiller.id, dataPayload);
      } else {
        await onCreateBiller(dataPayload);
      }
      closeModals();
    } catch (err: any) {
      alert(err?.message || 'Failed to save biller details.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save Product Changes or Create New
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parentBiller = billers.find((b) => b.biller_code === prodBillerCode);
      const dataPayload = {
        name: prodName.trim(),
        short_name: prodShortName.trim() || undefined,
        product_code: prodCode.trim().toUpperCase(),
        biller_code: prodBillerCode.trim().toUpperCase(),
        biller_name: parentBiller?.name || prodBillerCode,
        amount: prodIsVariable || prodAmount === '' ? null : Number(prodAmount),
        validity_days: prodValidity === '' ? null : Number(prodValidity),
        provider: prodProvider,
        is_available: prodAvailable,
        is_hot: prodHot,
      };

      if (isEditingProduct && selectedProduct) {
        await onUpdateProduct(selectedProduct.id, dataPayload);
      } else {
        await onCreateProduct(dataPayload);
      }
      closeModals();
    } finally {
      setIsSaving(false);
    }
  };

  // Image Upload handler for biller logo
  const handleBillerLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBillerLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.label.toLowerCase().includes(q) ||
      c.category_name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (c.section && c.section.toLowerCase().includes(q)) ||
      (c.icon && c.icon.toLowerCase().includes(q));

    const matchProvider =
      providerFilter === 'ALL' ||
      (c.provider && c.provider.toLowerCase() === providerFilter.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && c.is_available) ||
      (statusFilter === 'DISABLED' && !c.is_available);

    const matchHot = hotFilter === 'ALL' || (hotFilter === 'HOT_ONLY' && c.is_hot);

    return matchSearch && matchProvider && matchStatus && matchHot;
  });

  // Filter Billers
  const filteredBillers = billers.filter((b) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.short_name && b.short_name.toLowerCase().includes(q)) ||
      b.biller_code.toLowerCase().includes(q) ||
      (b.category_name && b.category_name.toLowerCase().includes(q));

    const matchProvider =
      providerFilter === 'ALL' ||
      (b.provider && b.provider.toLowerCase() === providerFilter.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && b.is_available) ||
      (statusFilter === 'DISABLED' && !b.is_available);

    const matchHot = hotFilter === 'ALL' || (hotFilter === 'HOT_ONLY' && b.is_hot);

    return matchSearch && matchProvider && matchStatus && matchHot;
  });

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.short_name && p.short_name.toLowerCase().includes(q)) ||
      p.product_code.toLowerCase().includes(q) ||
      p.biller_code.toLowerCase().includes(q) ||
      (p.biller_name && p.biller_name.toLowerCase().includes(q));

    const matchProvider =
      providerFilter === 'ALL' ||
      (p.provider && p.provider.toLowerCase() === providerFilter.toLowerCase());

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'AVAILABLE' && p.is_available) ||
      (statusFilter === 'DISABLED' && !p.is_available);

    const matchHot = hotFilter === 'ALL' || (hotFilter === 'HOT_ONLY' && p.is_hot);

    return matchSearch && matchProvider && matchStatus && matchHot;
  });

  // Category Icon Renderer: use semantic icon for SVG asset paths
  const renderCategoryIcon = (iconPath?: string | null, code?: string) => {
    if (iconPath && (iconPath.startsWith('http://') || iconPath.startsWith('https://') || iconPath.startsWith('data:'))) {
      return (
        <img
          src={iconPath}
          alt="icon"
          style={{ width: 18, height: 18, objectFit: 'contain' }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    return renderFallbackIcon(iconPath || code);
  };

  const renderFallbackIcon = (name?: string) => {
    const clean = (name || '').toLowerCase();
    if (clean.includes('airtime') || clean.includes('phone')) return <Phone size={15} />;
    if (clean.includes('data') || clean.includes('wifi')) return <Wifi size={15} />;
    if (clean.includes('electricity') || clean.includes('zap') || clean.includes('power')) return <Zap size={15} />;
    if (clean.includes('tv') || clean.includes('cable')) return <Tv size={15} />;
    if (clean.includes('internet') || clean.includes('globe')) return <Globe size={15} />;
    if (clean.includes('betting') || clean.includes('game')) return <Gamepad2 size={15} />;
    return <Receipt size={15} />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Navigation & Sub-Tabs Switcher */}
      <div
        className="card-standard"
        style={{
          padding: '16px 20px',
          background: 'var(--bg-white)',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => onSubTabChange('categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSubTab === 'categories' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
              background: activeSubTab === 'categories' ? '#eff6ff' : '#ffffff',
              color: activeSubTab === 'categories' ? 'var(--primary)' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <Tags size={16} />
            <span>Bill Category</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--r-full)',
                background: activeSubTab === 'categories' ? 'rgba(37, 99, 235, 0.15)' : '#f1f5f9',
                color: activeSubTab === 'categories' ? 'var(--primary)' : '#64748b',
              }}
            >
              {categories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('billers')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSubTab === 'billers' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
              background: activeSubTab === 'billers' ? '#eff6ff' : '#ffffff',
              color: activeSubTab === 'billers' ? 'var(--primary)' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <Store size={16} />
            <span>Billers</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--r-full)',
                background: activeSubTab === 'billers' ? 'rgba(37, 99, 235, 0.15)' : '#f1f5f9',
                color: activeSubTab === 'billers' ? 'var(--primary)' : '#64748b',
              }}
            >
              {billers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSubTabChange('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: activeSubTab === 'products' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
              background: activeSubTab === 'products' ? '#eff6ff' : '#ffffff',
              color: activeSubTab === 'products' ? 'var(--primary)' : '#64748b',
              transition: 'all 0.15s ease',
            }}
          >
            <Package size={16} />
            <span>Products</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--r-full)',
                background: activeSubTab === 'products' ? 'rgba(37, 99, 235, 0.15)' : '#f1f5f9',
                color: activeSubTab === 'products' ? 'var(--primary)' : '#64748b',
              }}
            >
              {products.length}
            </span>
          </button>
        </div>

        {/* Action Button: Add Custom Item */}
        <div>
          {activeSubTab === 'categories' && (
            <button
              type="button"
              onClick={openCreateCategory}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>Add Bill Category</span>
            </button>
          )}

          {activeSubTab === 'billers' && (
            <button
              type="button"
              onClick={openCreateBiller}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>Add Biller</span>
            </button>
          )}

          {activeSubTab === 'products' && (
            <button
              type="button"
              onClick={openCreateProduct}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card-standard"
        style={{
          padding: '14px 20px',
          background: 'var(--bg-white)',
          borderRadius: 'var(--r-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder={
              activeSubTab === 'categories'
                ? 'Search category, code, path...'
                : activeSubTab === 'billers'
                ? 'Search biller name or code...'
                : 'Search product name or package...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              fontSize: 12.5,
              borderRadius: 'var(--r-md)',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              fontSize: 12.5,
              borderRadius: 'var(--r-md)',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Providers</option>
            <option value="squad">Squad VAS</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            style={{
              padding: '7px 12px',
              fontSize: 12.5,
              borderRadius: 'var(--r-md)',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Active Only</option>
            <option value="DISABLED">Disabled Only</option>
          </select>

          {/* Hot deals filter */}
          <button
            type="button"
            onClick={() => setHotFilter(hotFilter === 'ALL' ? 'HOT_ONLY' : 'ALL')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              fontSize: 12.5,
              fontWeight: 500,
              borderRadius: 'var(--r-md)',
              border: hotFilter === 'HOT_ONLY' ? '1px solid #fde047' : '1px solid #e2e8f0',
              background: hotFilter === 'HOT_ONLY' ? '#fefce8' : '#ffffff',
              color: hotFilter === 'HOT_ONLY' ? '#a16207' : '#64748b',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={14} />
            <span>Hot Deals Only</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on Active Sub-Tab */}
      {activeSubTab === 'categories' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Category & Label</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Icon Path</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Section</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cashback %</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Validation Req.</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Default Rail</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No bill categories matched your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      onClick={() => openEditCategory(cat)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Category Label with Icon */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 'var(--r-md)',
                              background: '#eff6ff',
                              color: 'var(--primary)',
                              border: '1px solid #dbeafe',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              overflow: 'hidden',
                              padding: 4,
                            }}
                          >
                            {renderCategoryIcon(cat.icon, cat.code)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{cat.label}</span>
                              {cat.is_hot && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 6px',
                                    borderRadius: 'var(--r-full)',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    fontWeight: 700,
                                  }}
                                >
                                  Hot
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>{cat.category_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Icon Path */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 11,
                            color: '#64748b',
                            background: '#f8fafc',
                            padding: '3px 6px',
                            borderRadius: 4,
                            border: '1px solid #e2e8f0',
                            maxWidth: 180,
                            display: 'inline-block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={cat.icon || 'None'}
                        >
                          {cat.icon || 'None'}
                        </span>
                      </td>

                      {/* Code */}
                      <td style={{ padding: '14px 16px' }}>
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#f1f5f9',
                            padding: '3px 7px',
                            borderRadius: 4,
                            color: '#334155',
                          }}
                        >
                          {cat.code}
                        </code>
                      </td>

                      {/* Section */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '3px 8px',
                            borderRadius: 'var(--r-full)',
                            fontSize: 11.5,
                            fontWeight: 500,
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {cat.section || 'General'}
                        </span>
                      </td>

                      {/* Cashback % */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: 'var(--green)',
                          }}
                        >
                          <Percent size={13} />
                          <span>{Number(cat.cashback_percentage).toFixed(2)}%</span>
                        </span>
                      </td>

                      {/* Validation Req */}
                      <td style={{ padding: '14px 16px' }}>
                        {cat.requires_validation ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '2px 8px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11,
                              fontWeight: 600,
                              background: '#eff6ff',
                              color: 'var(--primary)',
                            }}
                          >
                            <Check size={12} />
                            <span>Required</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>None</span>
                        )}
                      </td>

                      {/* Provider */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 'var(--r-full)',
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            textTransform: 'capitalize',
                          }}
                        >
                          {cat.provider || 'squad'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {cat.is_available ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: 'var(--green)',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: '#94a3b8',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditCategory(cat);
                          }}
                          className="btn-outline"
                          style={{
                            padding: '5px 12px',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billers Tab View */}
      {activeSubTab === 'billers' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Biller Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Biller Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Provider Rail</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Cashback %</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBillers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No billers matched your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredBillers.map((biller) => (
                    <tr
                      key={biller.id}
                      onClick={() => openEditBiller(biller)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Name & Logo */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {biller.logo ? (
                            <img
                              src={biller.logo}
                              alt={biller.name}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 'var(--r-md)',
                                objectFit: 'contain',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: 2,
                              }}
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 'var(--r-md)',
                                background: '#eff6ff',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: 13,
                              }}
                            >
                              {biller.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{biller.name}</span>
                              {biller.is_hot && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: '1px 6px',
                                    borderRadius: 'var(--r-full)',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    fontWeight: 700,
                                  }}
                                >
                                  Hot
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 11.5, color: '#64748b' }}>
                              {biller.short_name || biller.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Biller Code */}
                      <td style={{ padding: '14px 16px' }}>
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#f1f5f9',
                            padding: '3px 7px',
                            borderRadius: 4,
                            color: '#334155',
                          }}
                        >
                          {biller.biller_code}
                        </code>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '3px 8px',
                            borderRadius: 'var(--r-full)',
                            fontSize: 11.5,
                            fontWeight: 500,
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {biller.category_name || 'Bill Service'}
                        </span>
                      </td>

                      {/* Provider Rail */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 'var(--r-full)',
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            textTransform: 'capitalize',
                          }}
                        >
                          {biller.provider || 'squad'}
                        </span>
                      </td>

                      {/* Cashback % */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: 'var(--green)',
                          }}
                        >
                          <Percent size={13} />
                          <span>{Number(biller.cashback_percentage).toFixed(2)}%</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {biller.is_available ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: 'var(--green)',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: '#94a3b8',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditBiller(biller);
                          }}
                          className="btn-outline"
                          style={{
                            padding: '5px 12px',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab View */}
      {activeSubTab === 'products' && (
        <div
          className="card-standard"
          style={{
            background: 'var(--bg-white)',
            borderRadius: 'var(--r-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 600 }}>Product / Package Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product Code</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Biller</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Pricing / Face Value</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Validity</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Provider</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                      No biller products matched your search filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      onClick={() => openEditProduct(prod)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Name */}
                      <td style={{ padding: '14px 18px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{prod.name}</span>
                            {prod.is_hot && (
                              <span
                                style={{
                                  fontSize: 10,
                                  padding: '1px 6px',
                                  borderRadius: 'var(--r-full)',
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  fontWeight: 700,
                                }}
                              >
                                Hot Deal
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: 11.5, color: '#64748b' }}>
                            {prod.short_name || prod.name}
                          </span>
                        </div>
                      </td>

                      {/* Product Code */}
                      <td style={{ padding: '14px 16px' }}>
                        <code
                          style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: 600,
                            background: '#f1f5f9',
                            padding: '3px 7px',
                            borderRadius: 4,
                            color: '#334155',
                          }}
                        >
                          {prod.product_code}
                        </code>
                      </td>

                      {/* Biller */}
                      <td style={{ padding: '14px 16px' }}>
                        <div>
                          <div style={{ fontWeight: 500, color: '#0f172a' }}>
                            {prod.biller_name || prod.biller_code}
                          </div>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{prod.biller_code}</span>
                        </div>
                      </td>

                      {/* Pricing / Face Value */}
                      <td style={{ padding: '14px 16px' }}>
                        {prod.amount !== null && prod.amount !== undefined ? (
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            ₦{Number(prod.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              padding: '2px 8px',
                              borderRadius: 'var(--r-full)',
                              fontSize: 11,
                              fontWeight: 500,
                              background: '#f1f5f9',
                              color: '#64748b',
                            }}
                          >
                            Variable / Flexible
                          </span>
                        )}
                      </td>

                      {/* Validity */}
                      <td style={{ padding: '14px 16px' }}>
                        {prod.validity_days ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 12,
                              color: '#475569',
                            }}
                          >
                            <Calendar size={13} style={{ color: '#94a3b8' }} />
                            <span>{prod.validity_days} Days</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>N/A</span>
                        )}
                      </td>

                      {/* Provider */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '3px 9px',
                            borderRadius: 'var(--r-full)',
                            fontSize: 11.5,
                            fontWeight: 600,
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            textTransform: 'capitalize',
                          }}
                        >
                          {prod.provider || 'squad'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        {prod.is_available ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: 'var(--green)',
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              fontSize: 12,
                              color: '#94a3b8',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#cbd5e1' }} />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditProduct(prod);
                          }}
                          className="btn-outline"
                          style={{
                            padding: '5px 12px',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN MODALS RENDERED VIA PORTAL TO COVER ENTIRE VIEWPORT
          ========================================================================= */}

      {/* 1. Category Modal (Add or Edit) */}
      {isCategoryModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
          }}
          onClick={closeModals}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 600,
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {isEditingCategory ? 'Edit Bill Category' : 'Add New Bill Category'}
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                  Configure category details, icon asset path, routing provider, and commission rules
                </p>
              </div>
              <button
                type="button"
                onClick={closeModals}
                disabled={isSaving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Icon Path & Preview */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Category SVG Icon Path *
                  </label>
                  <input
                    type="text"
                    required
                    value={catIconPath}
                    onChange={(e) => setCatIconPath(e.target.value)}
                    placeholder="e.g. assets/icons/bills/airtime.svg"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      fontFamily: 'monospace',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid #cbd5e1',
                    }}
                  />

                  {/* Preset Quick Paths */}
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>
                      Quick Path Presets:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {COMMON_ICON_PATHS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCatIconPath(preset)}
                          style={{
                            fontSize: 11,
                            fontFamily: 'monospace',
                            padding: '2px 8px',
                            borderRadius: 'var(--r-full)',
                            background: catIconPath === preset ? '#eff6ff' : '#f1f5f9',
                            color: catIconPath === preset ? 'var(--primary)' : '#475569',
                            border: catIconPath === preset ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                          }}
                        >
                          {preset.split('/').pop()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Label and Internal Category Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Display Label *
                    </label>
                    <input
                      type="text"
                      required
                      value={catLabel}
                      onChange={(e) => setCatLabel(e.target.value)}
                      placeholder="e.g. Airtime Top-Up"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Internal Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value.toLowerCase())}
                      placeholder="e.g. airtime"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                {/* Code & Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Category Code (Unique) *
                    </label>
                    <input
                      type="text"
                      required
                      value={catCode}
                      onChange={(e) => setCatCode(e.target.value.toUpperCase())}
                      placeholder="e.g. AIRTIME"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Section
                    </label>
                    <input
                      type="text"
                      value={catSection}
                      onChange={(e) => setCatSection(e.target.value)}
                      placeholder="Telecom, Utilities, Entertainment, Gaming..."
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                {/* Cashback & Provider */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Cashback Percentage (%)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={catCashback}
                        onChange={(e) => setCatCashback(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          paddingRight: 32,
                          fontSize: 13,
                          borderRadius: 'var(--r-md)',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                      <Percent
                        size={14}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Routing Provider
                    </label>
                    <select
                      value={catProvider}
                      onChange={(e) => setCatProvider(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                      }}
                    >
                      <option value="squad">Squad VAS (HabariPay)</option>
                    </select>
                  </div>
                </div>

                {/* Order */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={catOrder}
                    onChange={(e) => setCatOrder(parseInt(e.target.value, 10) || 1)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 'var(--r-md)',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </div>

                {/* Toggles */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 'var(--r-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={catReqValidation}
                      onChange={(e) => setCatReqValidation(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Requires Customer Validation
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Requires meter number, customer ID, or smartcard lookup before processing
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={catFeature}
                      onChange={(e) => setCatFeature(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Featured Category
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Highlight in app home screen quick bills bar
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={catHot}
                      onChange={(e) => setCatHot(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Mark as Hot Offer
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Display glowing flame/hot badge to drive transaction volume
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={catAvailable}
                      onChange={(e) => setCatAvailable(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Active & Available in Mobile Apps
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Enable or temporarily suspend payments for this category
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                  background: '#f8fafc',
                }}
              >
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={isSaving}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                >
                  {isSaving ? 'Saving...' : isEditingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 2. Biller Modal (Add or Edit) */}
      {isBillerModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
          }}
          onClick={closeModals}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {isEditingBiller ? 'Edit Standard Biller' : 'Add New Biller'}
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                  Configure biller brand, logo path, category assignment, and settlement provider
                </p>
              </div>
              <button
                type="button"
                onClick={closeModals}
                disabled={isSaving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBiller} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Logo Uploader / Preview */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 8 }}>
                    Biller Logo Path or Upload
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 14,
                      borderRadius: 'var(--r-md)',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 'var(--r-md)',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      {billerLogo ? (
                        <img
                          src={billerLogo}
                          alt="Biller preview"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <Store size={22} style={{ color: '#94a3b8' }} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        ref={billerFileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                        onChange={handleBillerLogoUpload}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => billerFileInputRef.current?.click()}
                          className="btn-outline"
                          style={{
                            padding: '6px 12px',
                            fontSize: 12,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                          }}
                        >
                          <Upload size={13} />
                          <span>Upload Image</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBillerUrlMode(!billerUrlMode)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 12,
                            color: 'var(--primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {billerUrlMode ? 'Hide path input' : 'Enter custom path/URL'}
                        </button>

                        {billerLogo && (
                          <button
                            type="button"
                            onClick={() => setBillerLogo(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 12,
                              color: '#ef4444',
                              cursor: 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0 0' }}>
                        Path (e.g. assets/icons/billers/mtn.png) or image upload
                      </p>
                    </div>
                  </div>

                  {billerUrlMode && (
                    <div style={{ marginTop: 8 }}>
                      <input
                        type="text"
                        placeholder="assets/icons/billers/mtn.png or https://..."
                        value={billerUrlInput}
                        onChange={(e) => {
                          setBillerUrlInput(e.target.value);
                          setBillerLogo(e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          fontSize: 12.5,
                          fontFamily: 'monospace',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Name & Short Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Full Biller Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={billerName}
                      onChange={(e) => setBillerName(e.target.value)}
                      placeholder="e.g. MTN Nigeria"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Short Name
                    </label>
                    <input
                      type="text"
                      value={billerShortName}
                      onChange={(e) => setBillerShortName(e.target.value)}
                      placeholder="e.g. MTN"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                {/* Biller Code & Category */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Biller Code (Unique) *
                    </label>
                    <input
                      type="text"
                      required
                      value={billerCode}
                      onChange={(e) => setBillerCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MTN_VTU"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Bill Category *
                    </label>
                    <select
                      value={billerCategoryId}
                      onChange={(e) => setBillerCategoryId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Provider Rail & Cashback */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Provider Rail
                    </label>
                    <select
                      value={billerProvider}
                      onChange={(e) => setBillerProvider(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                      }}
                    >
                      <option value="squad">Squad VAS</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Cashback Percentage (%)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="20"
                        value={billerCashback}
                        onChange={(e) => setBillerCashback(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          paddingRight: 32,
                          fontSize: 13,
                          borderRadius: 'var(--r-md)',
                          border: '1px solid #cbd5e1',
                        }}
                      />
                      <Percent
                        size={14}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Biller Description
                  </label>
                  <textarea
                    rows={2}
                    value={billerDescription}
                    onChange={(e) => setBillerDescription(e.target.value)}
                    placeholder="Brief description for mobile customers..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 12.5,
                      borderRadius: 'var(--r-md)',
                      border: '1px solid #cbd5e1',
                      resize: 'none',
                    }}
                  />
                </div>

                {/* Toggles */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 'var(--r-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={billerHot}
                      onChange={(e) => setBillerHot(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Mark as Hot Deal
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Highlight in top billers carousel and search priority
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={billerAvailable}
                      onChange={(e) => setBillerAvailable(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Active & Available
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Permit users to initiate transactions for this biller
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isEditingBiller && selectedBiller && onDeleteBiller ? 'space-between' : 'flex-end',
                  gap: 12,
                  background: '#f8fafc',
                }}
              >
                {isEditingBiller && selectedBiller && onDeleteBiller && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete biller "${selectedBiller.name}" (${selectedBiller.biller_code})?`)) {
                        setIsSaving(true);
                        try {
                          await onDeleteBiller(selectedBiller.id);
                          closeModals();
                        } catch {
                          alert('Failed to delete biller.');
                        } finally {
                          setIsSaving(false);
                        }
                      }
                    }}
                    disabled={isSaving}
                    style={{
                      fontSize: 12.5,
                      padding: '8px 14px',
                      borderRadius: 'var(--r-md)',
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Delete Biller</span>
                  </button>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={closeModals}
                    disabled={isSaving}
                    className="btn-outline"
                    style={{ padding: '8px 16px', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary"
                    style={{ padding: '8px 20px', fontSize: 13 }}
                  >
                    {isSaving ? 'Saving...' : isEditingBiller ? 'Save Changes' : 'Create Biller'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Product Modal (Add or Edit) */}
      {isProductModalOpen && mounted && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            boxSizing: 'border-box',
          }}
          onClick={closeModals}
        >
          <div
            className="animate-fade-in"
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              position: 'relative',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {isEditingProduct ? 'Edit Biller Product' : 'Add New Product'}
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
                  Configure package name, pricing value, validity days, and availability
                </p>
              </div>
              <button
                type="button"
                onClick={closeModals}
                disabled={isSaving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Product Name & Short Name */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Product / Package Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="e.g. MTN 1GB Data Bundle"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Short Name
                    </label>
                    <input
                      type="text"
                      value={prodShortName}
                      onChange={(e) => setProdShortName(e.target.value)}
                      placeholder="e.g. 1GB / 30D"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                {/* Product Code & Biller Code */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Product Code (Unique) *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodCode}
                      onChange={(e) => setProdCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MTN_1GB_30D"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Associated Biller *
                    </label>
                    <select
                      value={prodBillerCode}
                      onChange={(e) => setProdBillerCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                      }}
                    >
                      {billers.map((b) => (
                        <option key={b.id} value={b.biller_code}>
                          {b.name} ({b.biller_code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price / Amount & Validity Days */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
                        Amount (₦ NGN)
                      </label>
                      <label style={{ fontSize: 11.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={prodIsVariable}
                          onChange={(e) => {
                            setProdIsVariable(e.target.checked);
                            if (e.target.checked) setProdAmount('');
                          }}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span>Variable / Custom</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      disabled={prodIsVariable}
                      value={prodAmount}
                      onChange={(e) => setProdAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder={prodIsVariable ? 'Variable customer amount' : 'e.g. 1200'}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                        background: prodIsVariable ? '#f1f5f9' : '#ffffff',
                        color: prodIsVariable ? '#94a3b8' : '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                      Validity (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={prodValidity}
                      onChange={(e) => setProdValidity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                      placeholder="e.g. 30 (or blank for none)"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: 13,
                        borderRadius: 'var(--r-md)',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>

                {/* Provider Rail */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                    Provider Rail
                  </label>
                  <select
                    value={prodProvider}
                    onChange={(e) => setProdProvider(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: 13,
                      borderRadius: 'var(--r-md)',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                    }}
                  >
                    <option value="squad">Squad VAS (HabariPay)</option>
                  </select>
                </div>

                {/* Toggles */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '14px 16px',
                    borderRadius: 'var(--r-md)',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prodHot}
                      onChange={(e) => setProdHot(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Hot Deal / Popular Plan
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Feature at the top of the package selector
                      </p>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={prodAvailable}
                      onChange={(e) => setProdAvailable(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                        Product Available for Purchase
                      </span>
                      <p style={{ fontSize: 11.5, color: '#64748b', margin: '2px 0 0 0' }}>
                        Permit users to buy this specific package or data bundle
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 12,
                  background: '#f8fafc',
                }}
              >
                <button
                  type="button"
                  onClick={closeModals}
                  disabled={isSaving}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: 13 }}
                >
                  {isSaving ? 'Saving...' : isEditingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
