import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Clock, User, MapPin, Navigation } from 'lucide-react';
import Select from 'react-select';
import { ALL_NEPAL_LOCATIONS } from '../../constants/locations';
import { locationService } from '../../services/locationService';
import { toast } from 'sonner';

const kundaliSchema = z.object({
  name: z.string().min(2, 'नाम कम्तिमा २ अक्षरको हुनुपर्छ'),
  birthDate: z.string().min(1, 'जन्म मिति आवश्यक छ'),
  birthTime: z.string().min(1, 'जन्म समय आवश्यक छ'),
  birthPlace: z.string().min(2, 'जन्म स्थान आवश्यक छ'),
});

type KundaliFormValues = z.infer<typeof kundaliSchema>;

interface KundaliFormProps {
  onSubmit: (values: KundaliFormValues) => void;
  isLoading: boolean;
}

const locationOptions = ALL_NEPAL_LOCATIONS.map(loc => ({ value: loc, label: loc }));

const KundaliForm: React.FC<KundaliFormProps> = ({ onSubmit, isLoading }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const { handleSubmit, control, setValue, formState: { errors }, register } = useForm<KundaliFormValues>({
    resolver: zodResolver(kundaliSchema),
    defaultValues: {
      birthPlace: 'Kathmandu'
    }
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('तपाईंको ब्राउजरले स्थान पत्ता लगाउन सक्दैन।');
      return;
    }

    setIsDetecting(true);
    toast.info('तपाईंको स्थान पत्ता लगाउँदै...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const placeName = await locationService.reverseGeocode(latitude, longitude);
        if (placeName) {
          // Try to find the city in our list or just use the geocoded name
          setValue('birthPlace', placeName);
          toast.success(`स्थान पत्ता लाग्यो: ${placeName}`);
        } else {
          toast.error('स्थानको नाम पत्ता लगाउन सकिएन।');
        }
        setIsDetecting(false);
      },
      (error) => {
        console.error(error);
        toast.error('स्थान पत्ता लगाउन अनुमति मिलेन।');
        setIsDetecting(false);
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-3xl shadow-2xl border border-red-100">
      <div className="space-y-2">
        <label className="text-sm font-bold text-red-900 flex items-center gap-2">
          <User className="w-4 h-4" /> पूरा नाम (Full Name)
        </label>
        <input
          {...register('name')}
          className="w-full px-4 py-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          placeholder="तपाईंको नाम"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-red-900 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> जन्म मिति (Birth Date)
          </label>
          <input
            type="date"
            {...register('birthDate')}
            className="w-full px-4 py-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
          {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-red-900 flex items-center gap-2">
            <Clock className="w-4 h-4" /> जन्म समय (Birth Time)
          </label>
          <input
            type="time"
            {...register('birthTime')}
            className="w-full px-4 py-3 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
          />
          {errors.birthTime && <p className="text-xs text-red-500">{errors.birthTime.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-red-900 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> जन्म स्थान (Birth Place)
          </label>
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetecting}
            className="text-[10px] flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3 h-3 ${isDetecting ? 'animate-spin' : ''}`} />
            {isDetecting ? 'खोज्दै...' : 'मेरो स्थान पत्ता लगाउनुहोस्'}
          </button>
        </div>
        
        <Controller
          name="birthPlace"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={locationOptions}
              value={locationOptions.find(opt => opt.value === field.value) || { value: field.value, label: field.value }}
              onChange={(val) => field.onChange(val?.value)}
              placeholder="शहर वा जिल्ला छान्नुहोस्..."
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  padding: '2px',
                  borderColor: '#fecaca',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#ef4444'
                  }
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  overflow: 'hidden'
                })
              }}
            />
          )}
        />
        {errors.birthPlace && <p className="text-xs text-red-500">{errors.birthPlace.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            गणना गर्दै...
          </>
        ) : (
          'कुण्डली तयार गर्नुहोस्'
        )}
      </button>
    </form>
  );
};

export default KundaliForm;
