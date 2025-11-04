import React, { useEffect, useState } from 'react';
import api from '../../../utils/api';

const DashboardTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [priceData, setPriceData] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/market/items?withCities=true');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const fetchPriceDetails = async (item) => {
    setSelectedItem(item);
    setLoadingPrices(true);
    try {
      // Fetch all prices for this item
      const { data } = await api.get(`/api/market/prices/item/${item._id}`);
      setPriceData(Array.isArray(data) ? data : []);
    } catch (e) {
      setPriceData([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
    setPriceData([]);
  };

  // Group prices by city
  const groupedPrices = priceData.reduce((acc, price) => {
    if (!acc[price.city]) {
      acc[price.city] = [];
    }
    acc[price.city].push(price);
    return acc;
  }, {});

  // Sort prices by date within each city
  Object.keys(groupedPrices).forEach(city => {
    groupedPrices[city].sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  return (
    <div className="content-card">
      <h2>Product Dashboard</h2>
      <p style={{ color: '#94a3b8', marginBottom: 20 }}>Click on any product to view detailed price tracking across cities</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
          <label htmlFor="search">Search</label>
          <input
            id="search"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="form-group" style={{ flex: '0 1 180px', marginBottom: 0 }}>
          <label htmlFor="category">Category</label>
          <select id="category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
          </select>
        </div>
      </div>

      {loading && <div style={{ color: '#94a3b8' }}>Loading items…</div>}
      {!loading && filteredItems.length === 0 && (
        <div style={{ color: '#94a3b8' }}>No items found. Add some products first.</div>
      )}

      <div className="features-grid">
        {filteredItems.map(item => (
          <div 
            className="feature-card" 
            key={item._id} 
            style={{ cursor: 'pointer', textAlign: 'left' }}
            onClick={() => fetchPriceDetails(item)}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {item.category === 'Vegetables' ? '🥬' : '🍎'}
            </div>
            <h3 style={{ marginBottom: 6 }}>{item.name}</h3>
            <p style={{ fontSize: 13, marginBottom: 4 }}>{item.category} • {item.unit}</p>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{item.description || 'No description'}</p>
            {item.cities && item.cities.length > 0 ? (
              <p style={{ fontSize: 11, color: '#8b5cf6', marginBottom: 8 }}>
                📍 {item.cities.length} {item.cities.length === 1 ? 'city' : 'cities'}
              </p>
            ) : (
              <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                📍 No prices yet
              </p>
            )}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 12,
              color: '#a5b4fc',
              textAlign: 'center'
            }}>
              Click to view details →
            </div>
          </div>
        ))}
      </div>

      {/* Price Details Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ marginBottom: 8 }}>
                {selectedItem.category === 'Vegetables' ? '🥬' : '🍎'} {selectedItem.name}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                {selectedItem.category} • {selectedItem.unit} • {selectedItem.description || 'No description'}
              </p>
            </div>

            {loadingPrices && <div style={{ color: '#94a3b8' }}>Loading price data…</div>}

            {!loadingPrices && priceData.length === 0 && (
              <div style={{ color: '#94a3b8', padding: 20, textAlign: 'center' }}>
                No price data available for this product.
              </div>
            )}

             {!loadingPrices && priceData.length > 0 && (
               <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                 {Object.keys(groupedPrices).map(city => {
                   const cityPrices = groupedPrices[city].sort((a, b) => new Date(a.date) - new Date(b.date));
                   const prices = cityPrices.map(p => p.price);
                   const maxPrice = Math.max(...prices);
                   const minPrice = Math.min(...prices);
                   const priceRange = maxPrice - minPrice || 1;

                   const chartWidth = 700;
                   const chartHeight = 200;
                   const padding = { top: 20, right: 40, bottom: 40, left: 50 };
                   const graphWidth = chartWidth - padding.left - padding.right;
                   const graphHeight = chartHeight - padding.top - padding.bottom;

                   const xStep = cityPrices.length > 1 ? graphWidth / (cityPrices.length - 1) : 0;

                   const getY = (price) => {
                     const normalized = (price - minPrice) / priceRange;
                     return padding.top + graphHeight - (normalized * graphHeight);
                   };

                   const pathData = cityPrices.map((p, i) => {
                     const x = padding.left + (i * xStep);
                     const y = getY(p.price);
                     return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                   }).join(' ');

                   return (
                     <div key={city} style={{ marginBottom: 32 }}>
                       <h3 style={{ 
                         fontSize: 16, 
                         color: '#e2e8f0', 
                         marginBottom: 16,
                         padding: '8px 12px',
                         background: 'rgba(99,102,241,0.15)',
                         borderRadius: 8,
                         display: 'flex',
                         alignItems: 'center',
                         gap: 8
                       }}>
                         📍 {city} ({cityPrices.length} {cityPrices.length === 1 ? 'entry' : 'entries'})
                       </h3>

                       {/* Line Graph */}
                       <div style={{ 
                         background: 'rgba(51, 65, 85, 0.3)',
                         borderRadius: 12,
                         padding: 20,
                         marginBottom: 16,
                         overflowX: 'auto'
                       }}>
                         <svg width={chartWidth} height={chartHeight} style={{ display: 'block' }}>
                           {/* Grid lines */}
                           {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                             const y = padding.top + graphHeight - (ratio * graphHeight);
                             const priceValue = minPrice + (ratio * priceRange);
                             return (
                               <g key={ratio}>
                                 <line
                                   x1={padding.left}
                                   y1={y}
                                   x2={chartWidth - padding.right}
                                   y2={y}
                                   stroke="rgba(148, 163, 184, 0.15)"
                                   strokeWidth="1"
                                   strokeDasharray="4 4"
                                 />
                                 <text
                                   x={padding.left - 10}
                                   y={y + 4}
                                   textAnchor="end"
                                   fill="#94a3b8"
                                   fontSize="11"
                                 >
                                   {priceValue.toFixed(0)}
                                 </text>
                               </g>
                             );
                           })}

                           {/* Gradient for area under line */}
                           <defs>
                             <linearGradient id={`gradient-${city}`} x1="0" x2="0" y1="0" y2="1">
                               <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                               <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
                             </linearGradient>
                           </defs>

                           {/* Area under line */}
                           {cityPrices.length > 0 && (
                             <path
                               d={`
                                 ${pathData}
                                 L ${padding.left + ((cityPrices.length - 1) * xStep)} ${padding.top + graphHeight}
                                 L ${padding.left} ${padding.top + graphHeight}
                                 Z
                               `}
                               fill={`url(#gradient-${city})`}
                             />
                           )}

                           {/* Main line */}
                           <path
                             d={pathData}
                             fill="none"
                             stroke="#6366f1"
                             strokeWidth="3"
                             strokeLinecap="round"
                             strokeLinejoin="round"
                           />

                           {/* Data points */}
                           {cityPrices.map((p, i) => {
                             const x = padding.left + (i * xStep);
                             const y = getY(p.price);
                             return (
                               <g key={p._id}>
                                 <circle
                                   cx={x}
                                   cy={y}
                                   r="5"
                                   fill="#1e293b"
                                   stroke="#6366f1"
                                   strokeWidth="2"
                                 />
                                 <circle
                                   cx={x}
                                   cy={y}
                                   r="3"
                                   fill="#8b5cf6"
                                 />
                               </g>
                             );
                           })}

                           {/* X-axis labels (dates) */}
                           {cityPrices.map((p, i) => {
                             const x = padding.left + (i * xStep);
                             const dateLabel = new Date(p.date).toLocaleDateString('en-US', {
                               month: 'short',
                               day: 'numeric'
                             });
                             return (
                               <text
                                 key={`date-${i}`}
                                 x={x}
                                 y={chartHeight - padding.bottom + 20}
                                 textAnchor="middle"
                                 fill="#94a3b8"
                                 fontSize="11"
                               >
                                 {dateLabel}
                               </text>
                             );
                           })}

                           {/* Axis labels */}
                           <text
                             x={padding.left - 40}
                             y={padding.top + graphHeight / 2}
                             textAnchor="middle"
                             fill="#cbd5e1"
                             fontSize="12"
                             fontWeight="600"
                             transform={`rotate(-90, ${padding.left - 40}, ${padding.top + graphHeight / 2})`}
                           >
                             Price ({cityPrices[0]?.currency || 'PKR'})
                           </text>
                           <text
                             x={padding.left + graphWidth / 2}
                             y={chartHeight - 5}
                             textAnchor="middle"
                             fill="#cbd5e1"
                             fontSize="12"
                             fontWeight="600"
                           >
                             Date
                           </text>
                         </svg>
                       </div>
                       
                       {/* Collapsible Data Table */}
                       <details style={{ cursor: 'pointer' }}>
                         <summary style={{ 
                           color: '#8b5cf6',
                           fontSize: 13,
                           padding: '8px 12px',
                           background: 'rgba(139, 92, 246, 0.1)',
                           borderRadius: 8,
                           userSelect: 'none',
                           marginBottom: 8
                         }}>
                           📋 Show detailed table
                         </summary>
                         <div style={{ overflowX: 'auto', marginTop: 12 }}>
                           <table style={{ 
                             width: '100%', 
                             borderCollapse: 'collapse',
                             fontSize: 13
                           }}>
                             <thead>
                               <tr style={{ 
                                 background: 'rgba(51, 65, 85, 0.5)',
                                 borderBottom: '2px solid rgba(148, 163, 184, 0.2)'
                               }}>
                                 <th style={{ padding: '10px 12px', textAlign: 'left', color: '#cbd5e1' }}>#</th>
                                 <th style={{ padding: '10px 12px', textAlign: 'left', color: '#cbd5e1' }}>Date</th>
                                 <th style={{ padding: '10px 12px', textAlign: 'right', color: '#cbd5e1' }}>Price</th>
                                 <th style={{ padding: '10px 12px', textAlign: 'center', color: '#cbd5e1' }}>Currency</th>
                               </tr>
                             </thead>
                             <tbody>
                               {cityPrices.map((priceEntry, index) => (
                                 <tr 
                                   key={priceEntry._id}
                                   style={{ 
                                     borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                                     background: index % 2 === 0 ? 'rgba(51, 65, 85, 0.2)' : 'transparent'
                                   }}
                                 >
                                   <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{index + 1}</td>
                                   <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>
                                     {new Date(priceEntry.date).toLocaleDateString('en-US', {
                                       year: 'numeric',
                                       month: 'short',
                                       day: 'numeric'
                                     })}
                                   </td>
                                   <td style={{ 
                                     padding: '10px 12px', 
                                     textAlign: 'right',
                                     color: '#10b981',
                                     fontWeight: 600
                                   }}>
                                     {priceEntry.price.toFixed(2)}
                                   </td>
                                   <td style={{ 
                                     padding: '10px 12px', 
                                     textAlign: 'center',
                                     color: '#94a3b8'
                                   }}>
                                     {priceEntry.currency}
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       </details>
                     </div>
                   );
                 })}
               </div>
             )}

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button
                className="logout-btn"
                onClick={closeModal}
                style={{ minWidth: 120 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
