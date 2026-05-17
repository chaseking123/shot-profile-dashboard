import "./FilterCombobox.css";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type FilterComboboxOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type FilterComboboxProps<TValue extends string> = {
  label: string;
  value: TValue[];
  options: FilterComboboxOption<TValue>[];
  onValueChange: (value: TValue[]) => void;
};

export function FilterCombobox<TValue extends string>({
  label,
  value,
  options,
  onValueChange,
}: FilterComboboxProps<TValue>) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const concreteOptions = options.filter((option) => option.value !== "all");
  const filteredValues = value.filter((selectedValue) => selectedValue !== "all");
  const selectedValues =
    filteredValues.length > 0 ? filteredValues : concreteOptions.map((option) => option.value);
  const allSelected =
    concreteOptions.length > 0 &&
    concreteOptions.every((option) => selectedValues.includes(option.value));

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function setAllSelected() {
    onValueChange(concreteOptions.map((option) => option.value));
  }

  function toggleOption(optionValue: TValue) {
    const nextValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((selectedValue) => selectedValue !== optionValue)
      : [...selectedValues, optionValue];

    onValueChange(nextValues.length > 0 ? nextValues : concreteOptions.map((option) => option.value));
  }

  const summaryLabel = allSelected
    ? "All"
    : selectedValues.length === 1
      ? concreteOptions.find((option) => option.value === selectedValues[0])?.label ?? "1 selected"
      : `${selectedValues.length} selected`;

  return (
    <div className="filter-field" ref={rootRef}>
      <span className="filter-label" id={`${generatedId}-label`}>
        {label}
      </span>

      <div className={`filter-combobox${isOpen ? " filter-combobox--open" : ""}`}>
        <button
          type="button"
          className="filter-combobox__trigger"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-labelledby={`${generatedId}-label`}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="filter-combobox__summary">{summaryLabel}</span>
          <ChevronDown size={16} className="filter-combobox__chevron" aria-hidden="true" />
        </button>

        {isOpen ? (
          <div className="filter-combobox__content">
            <div className="filter-combobox__list" role="listbox" aria-multiselectable="true">
              <button
                type="button"
                className={`filter-combobox__item${allSelected ? " filter-combobox__item--selected" : ""}`}
                onClick={setAllSelected}
              >
                <span className="filter-combobox__item-check" aria-hidden="true">
                  {allSelected ? <Check size={14} /> : null}
                </span>
                <span>All</span>
              </button>

              {concreteOptions.map((option) => {
                const isSelected = selectedValues.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`filter-combobox__item${isSelected ? " filter-combobox__item--selected" : ""}`}
                    onClick={() => toggleOption(option.value)}
                  >
                    <span className="filter-combobox__item-check" aria-hidden="true">
                      {isSelected ? <Check size={14} /> : null}
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
