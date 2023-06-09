export type BasicDetailListItem = {
  label: {
    title: string;
    description?: string;
  };
  field: {
    variant: "text";
    value: string;
  } | {
    variant: "empty";
  }
};

type BasicDetailListProps = {
  items: BasicDetailListItem[];
};

export const BasicDetailList = ({ items }: BasicDetailListProps) => (
  <dl className="sm:divide-y sm:divide-gray-200">
    {items.map((item, index) => (
      <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5" key={index}>
        <div className="sm:col-span-1">
          <dt className="text-sm font-medium text-gray-500">
            {item.label.title}
          </dt>
          {item.label.description && (
            <span className="mt-1 text-sm text-gray-400">
              {item.label.description}
            </span>
          )}
        </div>
        {item.field.variant === "text" && (
          <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 overflow-hidden overflow-ellipsis">
            {item.field.value}
          </dd>
        )}
      </div>
    ))}
  </dl>
);
