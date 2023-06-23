import { type RouterOutputs, api } from "@timesheeter/app/utils/api";
import { DeleteConfirmationModal } from "@timesheeter/app/components/ui/DeleteConfirmationModal";

type DeleteTaskModalProps = {
  show: boolean;
  onClose: () => void;
  task: RouterOutputs["workspace"]["tasks"]["list"][number];
  refetchTasks: () => void;
};

export const DeleteTaskModal = ({
  show,
  onClose,
  task,
  refetchTasks,
}: DeleteTaskModalProps) => {
  const deleteMutation = api.workspace.tasks.delete.useMutation({
    onSuccess: () => {
      void refetchTasks();
    },
  });

  return (
    <DeleteConfirmationModal
      title="Delete task"
      description="Are you sure you want to delete this task?"
      show={show}
      onClose={onClose}
      onDelete={() => {
        deleteMutation.mutate({
          id: task.id,
          workspaceId: task.workspaceId,
        });
      }}
    />
  );
};
