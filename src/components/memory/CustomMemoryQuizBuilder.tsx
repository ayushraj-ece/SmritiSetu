import React, { useState, useEffect } from 'react';
import type { CustomMemoryQuestion } from '../../types';
import { offlineStorage } from '../../services/offlineStorage';
import { Image as ImageIcon, Plus, Trash2, HelpCircle, Check, Upload, Sparkles } from 'lucide-react';

interface Props {
  patientId: string;
}

const SAMPLE_PRESETS = [
  {
    title: 'Shillong Family Trip',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
    question: 'Where did our family gather for this summer holiday group photograph?',
    options: ['Shillong Hill View, Meghalaya', 'Tezpur River Bank, Assam', 'Loktak Lake, Manipur', 'Gangtok Town Square, Sikkim'],
    correctIndex: 0
  },
  {
    title: 'Ancestral Tea Estate Home',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    question: 'What is the name of our ancestral tea garden home shown in this photo?',
    options: ['Pine Villa Shillong', 'Green Valley Cottage Jorhat', 'Kaziranga Lodge', 'Sunflower Home Guwahati'],
    correctIndex: 1
  },
  {
    title: 'Diwali Festival Celebration',
    url: 'https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?auto=format&fit=crop&w=800&q=80',
    question: 'Which festival celebration is shown with family in this photograph?',
    options: ['Bihu Festival', 'Diwali Lights', 'Durga Puja', 'Hornbill Festival'],
    correctIndex: 1
  }
];

export const CustomMemoryQuizBuilder: React.FC<Props> = ({ patientId }) => {
  const [questions, setQuestions] = useState<CustomMemoryQuestion[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form state
  const [title, setTitle] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [opt0, setOpt0] = useState<string>('');
  const [opt1, setOpt1] = useState<string>('');
  const [opt2, setOpt2] = useState<string>('');
  const [opt3, setOpt3] = useState<string>('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);

  const loadQuestions = () => {
    setQuestions(offlineStorage.getCustomQuestions(patientId));
  };

  useEffect(() => {
    loadQuestions();
  }, [patientId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setTitle(preset.title);
    setImageUrl(preset.url);
    setQuestion(preset.question);
    setOpt0(preset.options[0]);
    setOpt1(preset.options[1]);
    setOpt2(preset.options[2]);
    setOpt3(preset.options[3]);
    setCorrectIndex(preset.correctIndex);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      alert('Please fill out the question and all 4 choices.');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80';

    const newQuestion: CustomMemoryQuestion = {
      id: `custom_q_${Date.now()}`,
      patientId: patientId || 'ASM58291',
      imageUrl: finalImage,
      title: title.trim() || 'Personal Memory Photo',
      question: question.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correctOptionIndex: correctIndex,
      createdAt: Date.now()
    };

    offlineStorage.saveCustomQuestion(newQuestion);

    // Reset Form
    setTitle('');
    setImageUrl('');
    setQuestion('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setCorrectIndex(0);
    setShowModal(false);

    loadQuestions();
  };

  const handleDelete = (id: string) => {
    offlineStorage.deleteCustomQuestion(id);
    loadQuestions();
  };

  return (
    <section className="bg-white border border-[#E2E8F0] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 text-[#0F172A] font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-[#0284C7]" />
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A]">
              Personalized Photo Memory Questions
            </h2>
            <p className="text-xs text-[#64748B] font-medium">
              Upload personal family photos and configure 4 multiple-choice options to test patient memory recall.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-xs px-5 py-3 rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Photo Memory Question</span>
        </button>
      </div>

      {/* List of Custom Questions */}
      {questions.length === 0 ? (
        <div className="p-8 text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#64748B] text-xs space-y-2 font-medium">
          <HelpCircle className="w-8 h-8 text-[#0284C7] mx-auto" />
          <p className="font-bold text-[#0F172A]">No personal photo memory questions created yet.</p>
          <p>Click "Add Photo Memory Question" above to upload a family photo and set 4 options.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-[#F8FAFC] border border-[#E2E8F0] p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold bg-[#F0F9FF] text-[#0284C7] px-3 py-1 rounded-full border border-[#BAE6FD]">
                    {q.title}
                  </span>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-[#94A3B8] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Photo Thumbnail */}
                <div className="w-full h-44 bg-black overflow-hidden rounded-xl border border-[#E2E8F0] relative">
                  <img src={q.imageUrl} alt={q.title} className="w-full h-full object-cover" />
                </div>

                <p className="font-bold text-base text-[#0F172A] leading-snug">
                  {q.question}
                </p>

                {/* Options List */}
                <div className="space-y-1.5 text-xs font-medium">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        idx === q.correctOptionIndex
                          ? 'bg-[#F0F9FF] border-[#BAE6FD] font-bold text-[#0284C7]'
                          : 'bg-white border-[#E2E8F0] text-[#64748B]'
                      }`}
                    >
                      <span>
                        <strong className="text-[#0284C7] mr-2">{String.fromCharCode(65 + idx)}.</strong>
                        {opt}
                      </span>
                      {idx === q.correctOptionIndex && (
                        <span className="text-[10px] uppercase font-bold text-[#0284C7] bg-white px-2 py-0.5 rounded-md border border-[#BAE6FD] flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#0284C7]" /> Correct Answer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E2E8F0] text-[#0F172A] max-w-xl w-full p-6 sm:p-8 rounded-2xl shadow-xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <h3 className="text-2xl font-extrabold text-[#0F172A]">
                Create Photo Memory Question
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#64748B] hover:text-[#0F172A] font-bold text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Sample Presets Bar */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#0284C7] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" /> Quick Preset Samples:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-xs bg-[#F8FAFC] hover:bg-[#F0F9FF] text-[#0F172A] hover:text-[#0284C7] border border-[#E2E8F0] px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Preset {i + 1}: {p.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-[#0F172A] mb-1">
                  Photo Title / Event Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family Trip to Shillong 2022"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-sm font-medium text-[#0F172A] rounded-xl focus:border-[#0284C7] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">
                  Upload Image File or Enter URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#0F172A] rounded-xl focus:border-[#0284C7] outline-none"
                  />
                  <label className="px-4 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-2 shrink-0 transition-all shadow-xs">
                    <Upload className="w-4 h-4 text-white" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {imageUrl && (
                <div className="w-full h-40 bg-black border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#0F172A] mb-1">
                  Memory Question for Patient
                </label>
                <input
                  type="text"
                  placeholder="e.g. Where was this family photo taken?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#0F172A] rounded-xl focus:border-[#0284C7] outline-none"
                  required
                />
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-[#0F172A]">
                  4 Multiple-Choice Options (Select radio button for Correct Answer)
                </label>

                {[
                  { val: opt0, set: setOpt0, label: 'Option A' },
                  { val: opt1, set: setOpt1, label: 'Option B' },
                  { val: opt2, set: setOpt2, label: 'Option C' },
                  { val: opt3, set: setOpt3, label: 'Option D' }
                ].map((optItem, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#F8FAFC] p-2.5 border border-[#E2E8F0] rounded-xl">
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="w-4 h-4 accent-[#0284C7] cursor-pointer"
                    />
                    <span className="font-bold text-[#0284C7] w-16">{optItem.label}:</span>
                    <input
                      type="text"
                      placeholder={`Enter ${optItem.label}`}
                      value={optItem.val}
                      onChange={(e) => optItem.set(e.target.value)}
                      className="flex-1 p-2 bg-white border border-[#E2E8F0] text-xs text-[#0F172A] rounded-lg focus:border-[#0284C7] outline-none"
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl shadow-xs cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
