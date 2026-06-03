interface Props {
  choices: string[];
  answer?: string;
  selected?: string | null;
  disabled?: boolean;
  showKeys?: boolean;
  compact?: boolean;
  onSelect: (choice: string, index: number) => void;
}

export function MultipleChoice({ choices, answer, selected, disabled, showKeys = true, compact = false, onSelect }: Props) {
  return (
    <div className={compact ? "choice-grid compact" : "choice-grid"}>
      {choices.map((choice, index) => {
        const stateClass =
          selected && answer === choice ? " correct" : selected === choice && answer !== choice ? " wrong" : "";
        return (
          <button
            key={`${choice}-${index}`}
            type="button"
            className={`choice-button${stateClass}`}
            disabled={disabled}
            onClick={() => onSelect(choice, index)}
          >
            {showKeys && <kbd>{index + 1}</kbd>}
            <span>{choice}</span>
          </button>
        );
      })}
    </div>
  );
}
