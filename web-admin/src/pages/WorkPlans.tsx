import { useEffect, useState } from 'react';
import type { WorkPlan } from '../services/api';
import { workPlanApi } from '../services/api';
import { ClipboardList, Plus, X, Pencil, Trash2 } from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
    PLANNED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-green-100 text-green-700',
};

/**
 * Admin page for managing building work plans.
 * CRUD with status management and optional image upload.
 */
export default function WorkPlans() {
    const [plans, setPlans] = useState<WorkPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editPlan, setEditPlan] = useState<WorkPlan | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('PLANNED');
    const [expectedDate, setExpectedDate] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchPlans = async () => {
        try {
            const res = await workPlanApi.getAll();
            if (res.data.data) setPlans(res.data.data);
        } catch (err) {
            console.error('Failed to fetch work plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const openCreateModal = () => {
        setEditPlan(null);
        setTitle('');
        setDescription('');
        setStatus('PLANNED');
        setExpectedDate('');
        setImage(null);
        setShowModal(true);
    };

    const openEditModal = (plan: WorkPlan) => {
        setEditPlan(plan);
        setTitle(plan.title);
        setDescription(plan.description);
        setStatus(plan.status);
        setExpectedDate(plan.expectedDate.slice(0, 10));
        setImage(null);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!title || !description || !expectedDate) return;
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('description', description);
            fd.append('status', status);
            fd.append('expectedDate', expectedDate);
            if (image) fd.append('image', image);

            if (editPlan) {
                await workPlanApi.update(editPlan.id, fd);
            } else {
                await workPlanApi.create(fd);
            }
            setShowModal(false);
            await fetchPlans();
        } catch (err) {
            console.error('Failed to save work plan:', err);
            alert('Failed to save work plan');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (plan: WorkPlan, newStatus: string) => {
        try {
            const fd = new FormData();
            fd.append('status', newStatus);
            await workPlanApi.update(plan.id, fd);
            await fetchPlans();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this work plan?')) return;
        try {
            await workPlanApi.delete(id);
            await fetchPlans();
        } catch (err) {
            console.error('Failed to delete work plan:', err);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ClipboardList size={28} className="text-blue-600" />
                    <h1 className="text-2xl font-bold text-slate-800">Work Plans</h1>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus size={18} /> Add Work Plan
                </button>
            </div>

            {loading ? (
                <p className="text-slate-400">Loading...</p>
            ) : plans.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <ClipboardList size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-400">No work plans yet. Click "Add Work Plan" to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                                <th className="px-5 py-3 text-left">Title</th>
                                <th className="px-5 py-3 text-left">Description</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Expected Date</th>
                                <th className="px-5 py-3 text-left">Image</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-800">{plan.title}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{plan.description}</td>
                                    <td className="px-5 py-3">
                                        <select
                                            value={plan.status}
                                            onChange={(e) => handleStatusChange(plan, e.target.value)}
                                            className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[plan.status]}`}
                                        >
                                            <option value="PLANNED">Planned</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">
                                        {new Date(plan.expectedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-3">
                                        {plan.imageUrl ? (
                                            <img
                                                src={`${API_ROOT}${plan.imageUrl}`}
                                                alt="plan"
                                                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                                            />
                                        ) : (
                                            <span className="text-slate-300 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button
                                            onClick={() => openEditModal(plan)}
                                            className="text-slate-400 hover:text-blue-600 mr-2 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-800">
                                {editPlan ? 'Edit Work Plan' : 'Add Work Plan'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="e.g. Elevator Maintenance"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    placeholder="Details about the work plan..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as typeof status)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="PLANNED">Planned</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Expected Date</label>
                                    <input
                                        type="date"
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !title || !description || !expectedDate}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Saving...' : editPlan ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
