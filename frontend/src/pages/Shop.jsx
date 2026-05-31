import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // API Products State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);

  // Pagination metadata
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters local states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  
  // Mobile Filter Drawer toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch Categories on load
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (e) {
        console.error(e.message);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products when filters or url change
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        
        if (search) queryParams.set('search', search);
        if (category) queryParams.set('category', category);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (sort) queryParams.set('sort', sort);
        queryParams.set('page', page);
        queryParams.set('limit', 6); // 6 products per page is perfect for clean shop pagination

        const { data } = await api.get(`/products?${queryParams.toString()}`);
        setProducts(data.products || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } catch (error) {
        console.error('Failed to retrieve catalog products:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, category, minPrice, maxPrice, sort, page]);

  // Sync state if URL changes from other pages (e.g. Navbar clicks)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setCategory(searchParams.get('category') || '');
    setPage(1); // reset to page 1 on filter trigger
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort) params.sort = sort;
    
    setSearchParams(params);
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchParams({});
    setPage(1);
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 fade-in">
      
      {/* Search and Filters Title Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black font-display text-slate-800 dark:text-white">Product Catalog</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Displaying <span className="font-bold text-primary-600 dark:text-primary-400">{products.length}</span> of {total} premium products
          </p>
        </div>

        {/* Search Input */}
        <div className="flex w-full md:w-auto items-center space-x-3">
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            className="w-full md:w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-primary-400"
          />

          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden p-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-xl active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ======================================= */}
        {/* DESKTOP SIDEBAR FILTER PANEL */}
        {/* ======================================= */}
        <aside className="hidden lg:block space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <span className="font-bold font-display text-base">Filter Parameters</span>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-slate-400 hover:text-red-500 hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => { setCategory(''); setPage(1); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                    category === ''
                      ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { setCategory(cat.slug); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      category === cat.slug
                        ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Price Range (₹)</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-400"
                />
              </div>
            </div>

            {/* Sort Select */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none text-slate-700 dark:text-slate-300 focus:border-primary-400"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="ratings">Top Rated</option>
              </select>
            </div>

            <button
              onClick={() => handleApplyFilters()}
              className="w-full btn-primary py-2.5 rounded-xl text-sm"
            >
              Apply Filter Params
            </button>
          </div>
        </aside>

        {/* ======================================= */}
        {/* PRODUCT GRID COLUMN */}
        {/* ======================================= */}
        <main className="lg:col-span-3 space-y-10">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            ) : products.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold font-display text-slate-800 dark:text-white">No Products Found</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  We couldn't match your filters. Try clearing pricing queries or category slug filters.
                </p>
                <button onClick={handleClearFilters} className="btn-secondary py-2 px-6 rounded-xl text-sm font-bold">
                  Reset Catalog
                </button>
              </div>
            ) : (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>

          {/* ======================================= */}
          {/* CATALOG PAGINATION ROW */}
          {/* ======================================= */}
          {pages > 1 && !loading && (
            <div className="flex justify-center items-center space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pages }).map((_, idx) => {
                const btnPage = idx + 1;
                return (
                  <button
                    key={btnPage}
                    onClick={() => handlePageChange(btnPage)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      page === btnPage
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {btnPage}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </main>
      </div>

      {/* ======================================= */}
      {/* MOBILE DRAWER PORT OVERLAY */}
      {/* ======================================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="w-80 max-w-full bg-white dark:bg-slate-900 p-6 flex flex-col h-full overflow-y-auto animate-slideIn">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-6">
              <h3 className="font-extrabold font-display text-lg text-slate-800 dark:text-white flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-primary-500" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Filters (Same as desktop) */}
            <div className="flex-1 space-y-6">
              {/* Categories */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Categories</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategory('')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      category === ''
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setCategory(cat.slug)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        category === cat.slug
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Price Range (₹)</span>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Sorting</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-300"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="ratings">Top Rated</option>
                </select>
              </div>

            </div>

            {/* Buttons Row */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <button
                onClick={handleApplyFilters}
                className="w-full btn-primary py-3 rounded-xl text-sm"
              >
                Apply Parameters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full btn-secondary py-3 rounded-xl text-sm text-slate-500"
              >
                Clear Filters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Shop;
