import { useEffect, useState } from "react";
import { FormFields } from "./_type";
type Props = {
  formData: FormFields;
  setSelectedYear: (year: string) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedDay: (day: string) => void;
};

export function useUpdateBirthDayInput({
  formData,
  setSelectedYear,
  setSelectedMonth,
  setSelectedDay,
}: Props) {
  useEffect(() => {
    if (formData.date_of_birth) {
      setSelectedYear(formData.date_of_birth.getFullYear().toString());
      setSelectedMonth(formData.date_of_birth.getMonth().toString());
      setSelectedDay(formData.date_of_birth.getDate().toString());
    }
  }, [formData.date_of_birth]);
}

export function useTrackFormEditionState(
  formData: FormFields,
  initialData: FormFields
) {
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setHasEdited(hasChanged);
  }, [formData, initialData]);

  return { hasEdited, setHasEdited };
}
