export default function EmptyState() {
  return (
    <div className="text-center py-10 text-gray-400">
      <p className="text-sm font-medium text-gray-500 mb-3">
        Paste anything that might require an action.
      </p>
      <ul className="text-sm space-y-1 text-gray-400 text-left inline-block">
        <li>• an email from your employer</li>
        <li>• a university announcement</li>
        <li>• a payment notice</li>
        <li>• an event invitation</li>
        <li>• a WhatsApp message</li>
      </ul>
    </div>
  );
}
