'use client';

/**
 * Visible labels with `input.hidden` / `display:none` do not open the iOS
 * file picker — PostHog records those as dead clicks on Upload CV.
 * Keep the input in the hit target with opacity:0 instead.
 */
export const CV_FILE_ACCEPT =
  '.pdf,.doc,.docx,.rtf,.txt,.md,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.heic,.heif,image/*,application/pdf';

export default function CvFileOverlay({
  id,
  disabled,
  onChange,
  'aria-label': ariaLabel = 'Upload CV',
}: {
  id?: string;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  'aria-label'?: string;
}) {
  return (
    <input
      id={id}
      type="file"
      accept={CV_FILE_ACCEPT}
      disabled={disabled}
      onChange={onChange}
      aria-label={ariaLabel}
      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
    />
  );
}
