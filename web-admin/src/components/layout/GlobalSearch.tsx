import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, User as UserIcon, Home, Car, MessageSquare, BarChart2, FileText, HelpCircle, File } from 'lucide-react';
import { searchApi } from '../../services/api';
import type { SearchResults } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResults | null>(null);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setLoading(true);
                try {
                    const res = await searchApi.globalSearch(query);
                    if (res.data.success && res.data.data) {
                        setResults(res.data.data);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults(null);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (path: string, state?: any) => {
        navigate(path, { state });
        setIsOpen(false);
        setQuery('');
        setResults(null);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className={`flex items-center bg-slate-100 rounded-full px-3 py-1.5 transition-all ${isOpen ? 'w-64 ring-2 ring-blue-500 bg-white shadow-sm' : 'w-48 hover:bg-slate-200 cursor-text'}`} onClick={() => setIsOpen(true)}>
                <SearchIcon size={16} className="text-slate-400 mr-2" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Хайх (Хэрэглэгч, байр...)"
                    className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
                    onFocus={() => setIsOpen(true)}
                />
                {query && isOpen && (
                    <button onClick={(e) => { e.stopPropagation(); setQuery(''); setResults(null); }} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (query.trim().length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-slate-500">Уншиж байна...</div>
                    ) : results ? (
                        <div className="py-2">
                            {results.users.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Хэрэглэгчид</h3>
                                    {results.users.map(u => (
                                        <div key={u.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/residents'); }}>
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><UserIcon size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{u.name}</div>
                                                <div className="text-xs text-slate-500">{u.phone}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.apartments.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Орон сууц / Түрээс</h3>
                                    {results.apartments.map(a => (
                                        <div key={a.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/residents', { highlightApartmentId: a.id }); }}>
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Home size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{a.buildingName} - {a.unitNumber} тоот</div>
                                                <div className="text-xs text-slate-500">{a.unitType}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.vehicles.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Тээврийн хэрэгсэл</h3>
                                    {results.vehicles.map(v => (
                                        <div key={v.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/vehicles'); }}>
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><Car size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{v.licensePlate}</div>
                                                <div className="text-xs text-slate-500">{v.makeModel}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.tickets.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Санал гомдол</h3>
                                    {results.tickets.map(t => (
                                        <div key={t.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/tickets', { highlightTicketId: t.id }); }}>
                                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><MessageSquare size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 line-clamp-1">{t.title}</div>
                                                <div className="text-xs text-slate-500">{t.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.polls?.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Санал асуулга (Санал)</h3>
                                    {results.polls.map(p => (
                                        <div key={p.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/polls'); }}>
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><BarChart2 size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 line-clamp-1">{p.title}</div>
                                                <div className="text-xs text-slate-500">{p.status}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.announcements?.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Зарлал & Баримт бичиг</h3>
                                    {results.announcements.map(a => (
                                        <div key={a.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/announcements'); }}>
                                            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600"><FileText size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 line-clamp-1">{a.title}</div>
                                                <div className="text-xs text-slate-500">{a.category}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.faqs?.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Түгээмэл асуулт (FAQ)</h3>
                                    {results.faqs.map(f => (
                                        <div key={f.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/content'); }}>
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><HelpCircle size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 line-clamp-1">{f.question}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {results.staticContents?.length > 0 && (
                                <div className="mb-2">
                                    <h3 className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Мэдээлэл (Дүрэм, Журам)</h3>
                                    {results.staticContents.map(s => (
                                        <div key={s.id} className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3" onMouseDown={(e) => { e.preventDefault(); handleSelect('/content'); }}>
                                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><File size={14} /></div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800 line-clamp-1">{s.title}</div>
                                                <div className="text-xs text-slate-500">{s.type}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(!results.users.length && !results.apartments.length && !results.vehicles.length && !results.tickets.length && !results.polls?.length && !results.announcements?.length && !results.faqs?.length && !results.staticContents?.length) && (
                                <div className="p-4 text-center text-sm text-slate-500">Илэрц олдсонгүй</div>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}