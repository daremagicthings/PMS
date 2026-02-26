import React, { useEffect, useState } from 'react';
import { contentApi } from '../services/api';
import type { Faq, StaticContent } from '../services/api';

export default function ContentSetup() {
    const [activeTab, setActiveTab] = useState<'FAQ' | 'RULES' | 'INQUIRIES'>('FAQ');

    // FAQ state
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loadingFaqs, setLoadingFaqs] = useState(true);

    // Static Content state
    const [rulesContent, setRulesContent] = useState<StaticContent | null>(null);
    const [inquiriesContent, setInquiriesContent] = useState<StaticContent | null>(null);
    const [rulesText, setRulesText] = useState('');
    const [inquiriesText, setInquiriesText] = useState('');
    const [loadingStatic, setLoadingStatic] = useState(true);
    const [savingStatic, setSavingStatic] = useState(false);

    // New FAQ Input
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');
    const [savingFaq, setSavingFaq] = useState(false);

    useEffect(() => {
        fetchFaqs();
        fetchStaticContent();
    }, []);

    const fetchFaqs = async () => {
        setLoadingFaqs(true);
        try {
            const res = await contentApi.getFaqs();
            if (res.data.success && res.data.data) {
                setFaqs(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoadingFaqs(false);
        }
    };

    const fetchStaticContent = async () => {
        setLoadingStatic(true);
        try {
            const rulesRes = await contentApi.getStaticContent('RULES');
            if (rulesRes.data.success && rulesRes.data.data) {
                setRulesContent(rulesRes.data.data);
                setRulesText(rulesRes.data.data.content);
            }
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching RULES content:', error);
            }
        }

        try {
            const inqRes = await contentApi.getStaticContent('INQUIRIES');
            if (inqRes.data.success && inqRes.data.data) {
                setInquiriesContent(inqRes.data.data);
                setInquiriesText(inqRes.data.data.content);
            }
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching INQUIRIES content:', error);
            }
        }
        setLoadingStatic(false);
    };

    const handleCreateFaq = async () => {
        if (!newQuestion.trim() || !newAnswer.trim()) {
            return;
        }

        setSavingFaq(true);
        try {
            await contentApi.createFaq({ question: newQuestion, answer: newAnswer, order: faqs.length });
            setNewQuestion('');
            setNewAnswer('');
            fetchFaqs();
        } catch (error) {
            console.error('Failed to create FAQ', error);
        } finally {
            setSavingFaq(false);
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (window.confirm('Энэ асуултыг устгахдаа итгэлтэй байна уу?')) {
            try {
                await contentApi.deleteFaq(id);
                fetchFaqs();
            } catch (error) {
                console.error('Failed to delete FAQ', error);
            }
        }
    };

    const handleSaveStaticContent = async (type: 'RULES' | 'INQUIRIES') => {
        setSavingStatic(true);
        try {
            const title = type === 'RULES' ? 'СӨХ-ийн дүрэм журам' : 'Лавлагаа / Санал хүсэлт';
            const content = type === 'RULES' ? rulesText : inquiriesText;

            await contentApi.upsertStaticContent(type, { title, content });
            window.alert('Мэдээлэл амжилттай хадгалагдлаа!');
            fetchStaticContent(); // refresh
        } catch (error) {
            console.error(`Failed to save ${type}`, error);
            window.alert('Хадгалахад алдаа гарлаа.');
        } finally {
            setSavingStatic(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Мэдээллийн сан тохируулах</h1>

            {/* Tabs */}
            <div className="flex space-x-4 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('FAQ')}
                    className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'FAQ'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Түгээмэл асуултууд (FAQ)
                </button>
                <button
                    onClick={() => setActiveTab('RULES')}
                    className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'RULES'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    СӨХ-ийн дүрэм журам
                </button>
                <button
                    onClick={() => setActiveTab('INQUIRIES')}
                    className={`pb-4 px-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'INQUIRIES'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Лавлагаа & Холбоо барих
                </button>
            </div>

            {/* TAB CONTENT: FAQ */}
            {activeTab === 'FAQ' && (
                <div className="space-y-6 max-w-4xl">
                    {/* Add New FAQ Form */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Шинэ асуулт нэмэх</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Асуулт</label>
                                <input
                                    type="text"
                                    value={newQuestion}
                                    onChange={(e) => setNewQuestion(e.target.value)}
                                    placeholder="Жнь: Сарын төлбөр хэзээ гарах вэ?"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Хариулт</label>
                                <textarea
                                    value={newAnswer}
                                    onChange={(e) => setNewAnswer(e.target.value)}
                                    rows={3}
                                    placeholder="Жнь: Сар бүрийн 25-нд гарна."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleCreateFaq}
                                disabled={savingFaq || !newQuestion || !newAnswer}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingFaq ? 'Нэмж байна...' : 'Нэмэх'}
                            </button>
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 mb-4">Одоо байгаа асуултууд ({faqs.length})</h2>
                        {loadingFaqs ? (
                            <p className="text-slate-500">Уншиж байна...</p>
                        ) : faqs.length === 0 ? (
                            <p className="text-slate-500 italic">Асуулт байхгүй байна.</p>
                        ) : (
                            <div className="space-y-4">
                                {faqs.map((faq) => (
                                    <div key={faq.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50 relative group">
                                        <button
                                            onClick={() => handleDeleteFaq(faq.id)}
                                            className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Устгах"
                                        >
                                            ✕
                                        </button>
                                        <p className="font-bold text-slate-900 mb-1">Q: {faq.question}</p>
                                        <p className="text-slate-700 whitespace-pre-wrap">A: {faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: RULES */}
            {activeTab === 'RULES' && (
                <div className="max-w-4xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">СӨХ-ийн дүрэм журам</h2>
                    <p className="text-sm text-slate-500 mb-6">Оршин суугчдын аппликейшн дээр харагдах дүрмийн эх бичвэрийг энд оруулна уу.</p>

                    {loadingStatic ? (
                        <p className="text-slate-500">Уншиж байна...</p>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={rulesText}
                                onChange={(e) => setRulesText(e.target.value)}
                                rows={15}
                                placeholder="СӨХ-ийн дүрмээ энд хуулж тавина уу..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                            <button
                                onClick={() => handleSaveStaticContent('RULES')}
                                disabled={savingStatic}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingStatic ? 'Хадгалж байна...' : 'Хадгалах'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: INQUIRIES */}
            {activeTab === 'INQUIRIES' && (
                <div className="max-w-4xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-2">Лавлагаа / Холбоо барих мэдээлэл</h2>
                    <p className="text-sm text-slate-500 mb-6">Оршин суугчид СӨХ-д холбогдох утас, хаяг болон бусад мэдээллийг эндруулна.</p>

                    {loadingStatic ? (
                        <p className="text-slate-500">Уншиж байна...</p>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={inquiriesText}
                                onChange={(e) => setInquiriesText(e.target.value)}
                                rows={10}
                                placeholder="Утас: 7000-0000\nЦахим шуудан: info@soh.mn..."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                            />
                            <button
                                onClick={() => handleSaveStaticContent('INQUIRIES')}
                                disabled={savingStatic}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {savingStatic ? 'Хадгалж байна...' : 'Хадгалах'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
