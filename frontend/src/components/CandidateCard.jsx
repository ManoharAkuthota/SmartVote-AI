import React, { useState } from 'react';
import { Check, Info, Award } from 'lucide-react';

export default function CandidateCard({
  candidate,
  isSelected,
  onSelect,
  disabled = false,
}) {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <div
      onClick={() => !disabled && onSelect(candidate)}
      className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900/90 border-amber-400 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
          : 'bg-slate-900/50 border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/70'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Selected check badge */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-lg animate-scale-in">
          <Check className="w-4 h-4" />
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Candidate Photo */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/30 shrink-0 bg-slate-950">
          <img
            src={candidate.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
            alt={candidate.fullName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Candidate Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white truncate">{candidate.fullName}</h3>
            <span className="text-xl shrink-0" title="Official Party Symbol">{candidate.partySymbol || '🪷'}</span>
          </div>

          <div className="text-xs font-semibold text-amber-400 mt-0.5">{candidate.partyName}</div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {candidate.manifesto || 'Committed to transparent democratic public governance and citizen empowerment.'}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowManifesto(!showManifesto);
              }}
              className="text-[11px] text-amber-400/90 hover:text-amber-300 flex items-center space-x-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>{showManifesto ? 'Hide Policy Manifesto' : 'Read Election Manifesto'}</span>
            </button>

            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
              isSelected ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
            }`}>
              {isSelected ? 'Selected on Ballot' : 'Choose Candidate'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Policy Manifesto */}
      {showManifesto && (
        <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <h4 className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Official Candidate Manifesto & Commitments:
          </h4>
          <p className="leading-relaxed whitespace-pre-wrap text-slate-300">{candidate.manifesto}</p>
        </div>
      )}
    </div>
  );
}
