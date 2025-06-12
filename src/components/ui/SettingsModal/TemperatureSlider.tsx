//geminiclone/src/components/ui/SettingsModal/TemperatureSlider.tsx
import { Sliders } from "lucide-react";

interface TemperatureSliderProps {
    temperature: number;
    onChange: (value: number) => void;
  }
  
  export default function TemperatureSlider({ temperature, onChange }: TemperatureSliderProps) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sliders size={16} className="text-purple-500 dark:text-purple-400" />
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">Temperature: {temperature.toFixed(1)}</label>
        </div>
        <input 
          type="range" 
          min="0" 
          max="2" 
          step="0.1" 
          value={temperature}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full accent-purple-600 dark:accent-purple-500" 
        />
        <div className="mt-1 grid grid-cols-3 text-xs text-gray-500 dark:text-gray-400">
          <div>More predictable</div>
          <div className="text-center">Balanced</div>
          <div className="text-right">More creative</div>
        </div>
      </div>
    );
  }