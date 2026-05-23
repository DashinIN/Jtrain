interface Props {
  choices: string[];
  answer?: string;
  selected?: string | null;
  disabled?: boolean;
  onSelect: (choice: string, index: number) => void;
}

export function MultipleChoice({ choices, answer, selected, disabled, onSelect }: Props) {
  return (
    <div className="choice-grid">
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
            <kbd>{index + 1}</kbd>
            <span>{choice}</span>
          </button>
        );
      })}
    </div>
  );
}
