import { useOrderActions } from "@/app/hooks/useOrderActions";
import { useOrderFlowStore } from "@/app/store/useOrderFlowStore";
import { orderActions } from "@/app/utils/order-actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";

export function OrderFlowActions({ role, order }: any) {
  const actions = useOrderActions();
  const { HandleOpenOrderFlowModal } = useOrderFlowStore();

  const activeButton = orderActions.filter(
    (a) =>
      a.role.includes(role) &&
      a.status.includes(order.status) &&
      (!a.serviceType || a.serviceType.includes(order.service_type))
  );

  if (activeButton.length < 1) return null;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4">
        {activeButton.map((action) => (
          <Button
            key={action.key}
            className={`${action.key === "decisionCancel" && "bg-red-400 hover:bg-red-500"}`}
            disabled={actions.loadingAction === action.key}
            onClick={() => {
              if (
                action.key === "waitingDecision" ||
                action.key === "waitingPayment" ||
                action.key === "decisionCancel"
              ) {
                HandleOpenOrderFlowModal(
                  order.id,
                  action.key as
                    | "waitingDecision"
                    | "waitingPayment"
                    | "decisionCancel",
                  role
                );
              } else if (
                action.key === "toTechnician" ||
                action.key === "cancelled" ||
                action.key === "completed" ||
                action.key === "completedOnSite"
              ) {
                actions[action.key](order.id, role);
              } else if (action.key === "decisionApprove") {
                actions.decision(
                  "decisionApprove",
                  order.id,
                  { decision: "approve" },
                  role
                );
              } else {
                actions[action.key](order.id);
              }
            }}
          >
            {actions.loadingAction === action.key && (
              <Loader2Icon className="animate-spin" />
            )}
            {action.label}
          </Button>
        ))}
      </div>
      <hr />
    </>
  );
}
