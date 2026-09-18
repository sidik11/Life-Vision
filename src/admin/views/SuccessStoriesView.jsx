import React, { useState } from 'react';
import StatusBadge from '../components/Common/StatusBadge';
import { Plus, Edit, Trash2, Eye, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function SuccessStoriesView({ stories = [], setStories, onAddStory, onDeleteStory, showToast, onShowToast, activeSubTab = 'all-stories' }) {
  const notify = showToast || onShowToast || (() => {});
  const [subTab, setSubTab] = useState(activeSubTab);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [program, setProgram] = useState('Tailoring & Stitching');
  const [location, setLocation] = useState('Bhubaneswar, Odisha');
  const [quote, setQuote] = useState('');
  const [storyText, setStoryText] = useState('');
  const [outcome, setOutcome] = useState('');

  const handleTogglePublish = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    if (setStories) {
      setStories(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    }
    notify(`Story status updated to ${nextStatus}!`, 'success');
  };

  const handleAdd = () => {
    if (!name) {
      notify('Please enter Beneficiary Name', 'error');
      return;
    }
    const created = {
      id: `STOR-0${stories.length + 1}`,
      name,
      program,
      location,
      photo: '/success_story.jpg',
      quote: quote || 'Life Vision Society changed my life.',
      story: storyText || 'Beneficiary successfully completed training and gained employment.',
      outcome: outcome || 'Earns sustainable monthly income',
      status: 'Published'
    };

    if (setStories) {
      setStories([created, ...stories]);
    } else if (onAddStory) {
      onAddStory(created);
    }
    setShowModal(false);
    setName('');
    setQuote('');
    setStoryText('');
    setOutcome('');
    notify(`Success story for ${created.name} saved!`, 'success');
  };

  const filteredStories = stories.filter(s => {
    if (subTab === 'featured-stories') return s.status === 'Published' || s.featured;
    if (subTab === 'draft-stories') return s.status === 'Draft';
    if (subTab === 'published-stories') return s.status === 'Published';
    return true; // all-stories or add-success-story
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-serif">Success Stories & Beneficiary Testimonials</h1>
          <p className="text-xs text-slate-500">Manage real beneficiary impact stories, micro-entrepreneurship journeys & public site highlights</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>+ Add Success Story</span>
        </button>
      </div>

      {/* Sub Nav Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all-stories', label: '📖 All Stories', count: stories.length },
          { id: 'featured-stories', label: '🌟 Featured' },
          { id: 'published-stories', label: '📢 Published' },
          { id: 'draft-stories', label: '📝 Drafts' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              subTab === tab.id 
                ? 'bg-[#123B5D] text-white shadow-sm' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label} {tab.count !== undefined && <span className="ml-1 opacity-75">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Grid of Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStories.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 font-bold">
            No success stories found in this section.
          </div>
        ) : (
          filteredStories.map((st) => (
            <div key={st.id} className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img src={st.photo || '/success_story.jpg'} alt={st.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/30" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-serif">{st.name}</h3>
                    <p className="text-xs text-emerald-700 font-bold">{st.program} • {st.location}</p>
                  </div>
                </div>
                <StatusBadge status={st.status} />
              </div>

              <p className="text-xs text-slate-700 italic bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-serif">
                "{st.quote}"
              </p>

              <p className="text-xs text-slate-600 leading-relaxed">{st.story}</p>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                Outcome: {st.outcome}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleTogglePublish(st.id, st.status)}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {st.status === 'Published' ? '[ Unpublish ]' : '[ Publish Story ]'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Story Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-slate-900 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 font-serif">Add Success Story</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Beneficiary Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Key Quote</label>
                <input type="text" value={quote} onChange={(e) => setQuote(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Full Story</label>
                <textarea rows="3" value={storyText} onChange={(e) => setStoryText(e.target.value)} className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
              </div>
              <div>
                <label className="font-semibold text-slate-700">Livelihood Outcome</label>
                <input type="text" value={outcome} onChange={(e) => setOutcome(e.target.value)} placeholder="e.g. Earns ₹18,000/month" className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900" />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Cancel</button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-[#123B5D] text-white rounded-xl text-xs font-bold shadow-md"
              >
                Save & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
