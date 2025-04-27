'use client';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export default function QuestionStepper({
  value,
  onChange,
  min = 10,
  max = 50,
}: Props) {
  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDecrement}
        className="w-8 h-8 rounded-md bg-gray-700 text-white text-lg font-bold hover:bg-gray-600"
      >
        –
      </button>
      <span className="text-white text-lg font-medium">{value}</span>
      <button
        onClick={handleIncrement}
        className="w-8 h-8 rounded-md bg-gray-700 text-white text-lg font-bold hover:bg-gray-600"
      >
        +
      </button>
    </div>
  );
}