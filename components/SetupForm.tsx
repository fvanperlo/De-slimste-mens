import React, { useState } from 'react';
import { TermInput } from '../types';
import { Wand2 } from 'lucide-react';

interface SetupFormProps {
  onGenerate: (theme: string, terms: TermInput[]) => void;
  isGenerating: boolean;
}

const SetupForm: React.FC<SetupFormProps> = ({ onGenerate, isGenerating }) => {
  const [theme, setTheme] = useState('');
  const [terms, setTerms] = useState<TermInput[]>([
    { id: '1', term: '', userClues: ['', '', ''] },
    { id: '2', term: '', userClues: ['', '', ''] },
    { id: '3', term: '', userClues: ['', '', ''] },
    { id: '4', term: '', userClues: ['', '', ''] },
  ]);

  const [expandedTermId, setExpandedTermId] = useState<string | null>('1');

  const handleTermChange = (id: string, value: string) => {
    setTerms(prev => prev.map(t => t.id === id ? { ...t, term: value } : t));
  };

  const handleClueChange = (termId: string, clueIndex: number, value: string) => {
    setTerms(prev => prev.map(t => {
      if (t.id !== termId) return t;
      const newClues = [...t.userClues];
      newClues[clueIndex] = value;
      return { ...t, userClues: newClues };
    }));
  };

  const isValid = terms.every(t => t.term.trim().length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onGenerate(theme, terms);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-[#cc0000] border border-[#ff6666] rounded shadow-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white tracking-tight uppercase mb-2">De Slimste Mens Puzzel</h1>
        <p className="text-white/90">Vul 4 begrippen in. Omschrijvingen zijn optioneel (AI maakt ze voor je).</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-1 uppercase tracking-wide">Thema (Optioneel)</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Bijv. Hoofdsteden, Bekende Nederlanders..."
            className="w-full bg-[#b30000] border-[#d90000] text-white rounded px-4 py-3 focus:ring-2 focus:ring-white focus:border-transparent outline-none transition-all placeholder-white/50"
          />
        </div>

        <div className="space-y-4">
          {terms.map((term, index) => (
            <div key={term.id} className={`bg-[#d90000] rounded border ${expandedTermId === term.id ? 'border-white' : 'border-[#ff6666]'} overflow-hidden transition-all duration-300`}>
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#e60000] transition-colors"
                onClick={() => setExpandedTermId(expandedTermId === term.id ? null : term.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#990000] text-white font-bold text-sm">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={term.term}
                    onChange={(e) => handleTermChange(term.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`Begrip ${index + 1}`}
                    className="bg-transparent border-none text-white font-semibold focus:ring-0 w-full placeholder-white/50 text-lg"
                  />
                </div>
                <div className="text-white/80">
                  {expandedTermId === term.id ? '▼' : '▶'}
                </div>
              </div>

              {expandedTermId === term.id && (
                <div className="p-4 pt-0 border-t border-[#ff6666] bg-black/5">
                  <p className="text-xs text-white/90 uppercase tracking-wider mb-3 mt-3">Optionele omschrijvingen (max 3)</p>
                  <div className="space-y-2">
                    {term.userClues.map((clue, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={clue}
                        onChange={(e) => handleClueChange(term.id, idx, e.target.value)}
                        placeholder={`Omschrijving ${idx + 1}`}
                        className="w-full bg-[#b30000] border-[#cc0000] text-white text-sm rounded px-3 py-2 focus:ring-1 focus:ring-white focus:border-transparent outline-none placeholder-white/40"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={!isValid || isGenerating}
          className={`w-full py-4 rounded font-bold text-xl uppercase tracking-widest transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2
            ${isValid && !isGenerating 
              ? 'bg-white text-[#cc0000] hover:bg-gray-100 shadow-lg' 
              : 'bg-[#b30000] text-white/50 cursor-not-allowed'}`}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-[#cc0000] border-t-transparent rounded-full"></div>
              Genereren...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Start Puzzel
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SetupForm;