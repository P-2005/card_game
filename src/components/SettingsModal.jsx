import React, { useState } from "react";
import { storage } from "../utils/storage";
import { sound } from "../utils/sound";

export const SettingsModal = ({ isOpen, onClose, onResetProfile }) => {
  const [apiKey, setApiKey] = useState(storage.getApiKey());
  const [saveStatus, setSaveStatus] = useState("");

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playClick();
    storage.saveApiKey(apiKey);
    setSaveStatus("Saved successfully! ✅");
    setTimeout(() => {
      setSaveStatus("");
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    sound.playClick();
    if (window.confirm("⚠️ WARNING: This will delete all your earned cards, streaks, and match statistics. Are you sure you want to reset your profile?")) {
      onResetProfile();
      setSaveStatus("Profile reset! 🗑️");
      setTimeout(() => {
        setSaveStatus("");
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    sound.playClick();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-navy-900 border-2 border-gray-800 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Header decoration line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-gold to-pitch"></div>

        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-700/80 p-2 rounded-full transition-colors"
        >
          ✕
        </button>

        <h2 className="font-bebas text-2xl text-white tracking-widest mb-4">
          GAME SETTINGS ⚙️
        </h2>

        <div className="space-y-6">
          {/* API Key Form */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Anthropic Claude API Key (Optional)
            </label>
            <p className="text-[11px] text-gray-500 leading-normal">
              Entering your Claude API key unlocks live, dynamically generated World Cup trivia quiz questions. If left blank, the game uses its high-quality offline database of 100+ questions.
            </p>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-navy-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-gold transition-colors font-mono"
            />
            <div className="text-[10px] text-gray-500">
              *Your key is saved directly to your browser's local storage and is only called to request quiz questions from Anthropic's server.
            </div>
          </div>

          {/* Reset profile */}
          <div className="border-t border-gray-800/60 pt-4 text-left">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Danger Zone
            </h3>
            <button
              onClick={handleReset}
              className="bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 text-red-400 font-bebas text-sm px-4 py-2.5 rounded-xl w-full transition-all duration-300 active:scale-95"
            >
              RESET PROFILE PROGRESS ⚠️
            </button>
          </div>

          {/* Status Message */}
          {saveStatus && (
            <div className="bg-navy-950 border border-gray-800 text-gold text-xs font-semibold py-2 px-4 rounded-xl text-center animate-bounce">
              {saveStatus}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex gap-3 border-t border-gray-800/60 pt-4">
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bebas py-2.5 rounded-xl transition-all"
            >
              CLOSE
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gold text-black font-bebas py-2.5 rounded-xl border border-yellow-300 shadow-md shadow-gold/10 hover:bg-yellow-400 transition-all"
            >
              SAVE CHANGES
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
