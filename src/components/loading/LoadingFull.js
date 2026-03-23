import { Loading } from "./Loading";

export const LoadingFullScreen = ({ isLoading }) => {
  return (
    isLoading && (
      <div
        className={`
          fixed inset-0 bg-black/50 transition-opacity duration-300 z-[999] flex items-center justify-center w-full h-full
          ${isLoading ? "opacity-100" : "opacity-0 pointer-events-none"}

        `}
      >
        <Loading isLoading />
      </div>
    )
  );
};