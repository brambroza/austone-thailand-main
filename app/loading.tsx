interface ILoadingProps {
  message?: string;
}

export default function Loading({ message }: ILoadingProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        {message && <div className="text-sm text-gray-500">{message}</div>}
      </div>
    </div>
  );
}
