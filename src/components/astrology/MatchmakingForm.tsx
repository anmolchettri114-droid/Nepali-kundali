import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Calendar, Clock, User, MapPin } from 'lucide-react';
import Select from 'react-select';
import { ALL_NEPAL_LOCATIONS } from '../../constants/locations';

const personSchema = z.object({
  name: z.string().min(2, 'नाम आवश्यक छ'),
  birthDate: z.string().min(1, 'जन्म मिति आवश्यक छ'),
  birthTime: z.string().min(1, 'जन्म समय आवश्यक छ'),
  birthPlace: z.string().min(2, 'जन्म स्थान आवश्यक छ'),
});

const matchmakingSchema = z.object({
  person1: personSchema,
  person2: personSchema,
});

type MatchmakingFormValues = z.infer<typeof matchmakingSchema>;

interface MatchmakingFormProps {
  onSubmit: (values: MatchmakingFormValues) => void;
  isLoading: boolean;
}

const locationOptions = ALL_NEPAL_LOCATIONS.map(loc => ({ value: loc, label: loc }));

const MatchmakingForm: React.FC<MatchmakingFormProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<MatchmakingFormValues>({
    resolver: zodResolver(matchmakingSchema),
    defaultValues: {
      person1: { birthPlace: 'Kathmandu' },
      person2: { birthPlace: 'Kathmandu' }
    }
  });

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      borderRadius: '0.75rem',
      padding: '2px',
      borderColor: '#fecaca',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#ef4444'
      }
    }),
    menu: (base: any) => ({
      ...base,
      borderRadius: '0.75rem',
      overflow: 'hidden'
    })
  };

  const PersonForm = ({ title, prefix }: { title: string, prefix: 'person1' | 'person2' }) => (
    <div className="space-y-4 p-6 bg-red-50/50 rounded-2xl border border-red-100">
      <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
        <User className="w-5 h-5 text-red-600" /> {title}
      </h3>
      <div className="space-y-3">
        <input
          {...register(`${prefix}.name`)}
          placeholder="नाम"
          className="w-full px-4 py-2 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 outline-none"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            {...register(`${prefix}.birthDate`)}
            className="w-full px-4 py-2 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 outline-none"
          />
          <input
            type="time"
            {...register(`${prefix}.birthTime`)}
            className="w-full px-4 py-2 rounded-xl border border-red-200 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
        
        <Controller
          name={`${prefix}.birthPlace`}
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={locationOptions}
              value={locationOptions.find(opt => opt.value === field.value) || { value: field.value, label: field.value }}
              onChange={(val) => field.onChange(val?.value)}
              placeholder="जन्म स्थान छान्नुहोस्..."
              isSearchable
              styles={selectStyles}
            />
          )}
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-red-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PersonForm title="पहिलो व्यक्ति (Person 1)" prefix="person1" />
        <PersonForm title="दोस्रो व्यक्ति (Person 2)" prefix="person2" />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-100 transition-all flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            मिलान गणना गर्दै...
          </>
        ) : (
          <>
            <Heart className="w-5 h-5" />
            गुण मिलान गर्नुहोस् (Check Compatibility)
          </>
        )}
      </button>
    </form>
  );
};

export default MatchmakingForm;
