import { safeTrackingUrl, timelineSteps } from "@/lib/fulfillment";

export function OrderTimeline({
  stage,
  updates,
  trackingUrl,
}: {
  stage?: string | null;
  updates: { kind: string }[];
  trackingUrl?: string | null;
}) {
  const steps = timelineSteps(stage, updates);
  const link = safeTrackingUrl(trackingUrl);

  return (
    <ol className="font-inter">
      {steps.map((step, index) => {
        const done = step.state === "done";
        const current = step.state === "current";
        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`mt-1 h-3 w-3 rounded-full border-2 ${
                  current
                    ? "border-primary bg-primary"
                    : done
                      ? "border-primary bg-primary/30"
                      : "border-gray-200 bg-white"
                }`}
              />
              {index < steps.length - 1 && (
                <span className={`w-px flex-1 min-h-6 ${done ? "bg-primary/40" : "bg-gray-200"}`} />
              )}
            </div>
            <div className="pb-4">
              <p className={`text-sm ${current ? "font-bold text-[#1a1a1b]" : done ? "text-[#1a1a1b]" : "text-gray-400"}`}>
                {step.label}
                {current ? " · now" : ""}
              </p>
              {step.key === "shipped" && (current || done) && link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-primary underline underline-offset-2"
                >
                  Delivery tracking link
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
