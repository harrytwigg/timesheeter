import { useZodForm } from "@timesheeter/app/utils/zod-form";
import {
  createIntegrationSchema,
  updateIntegrationSchema,
  INTEGRATION_DEFINITIONS,
  getDefaultConfig,
  type IntegrationVariant,
} from "@timesheeter/app/lib/workspace/integrations";
import { api, type RouterOutputs } from "@timesheeter/app/utils/api";
import React, { useEffect } from "react";
import { INTEGRATIONS_HELP_TEXT } from "@timesheeter/app/lib/workspace/integrations";
import { z } from "zod";
import { SideOver } from "@timesheeter/app/components/ui/SideOver";
import { BasicForm } from "@timesheeter/app/components/ui/forms/BasicForm/BasicForm";
import { type BasicFormItemProps } from "@timesheeter/app/components/ui/forms/BasicForm/BasicFormItem";
import { type FieldError } from "react-hook-form";

const mutationSchema = z.union([
  createIntegrationSchema.extend({
    new: z.literal(true),
  }),
  updateIntegrationSchema.extend({
    new: z.literal(false),
  }),
]);

type EditIntegrationSideOverProps = {
  refetchIntegrations: () => unknown;
  show: boolean;
  onClose: () => void;
  data:
    | {
        new: true;
      }
    | {
        new: false;
        integration: RouterOutputs["workspace"]["integrations"]["list"][0];
      };
  workspaceId: string;
};

export const EditIntegrationSideOver = ({
  refetchIntegrations,
  show,
  onClose,
  data,
  workspaceId,
}: EditIntegrationSideOverProps) => {
  const getDefaultValues = () =>
    data.new
      ? {
          new: true as const,
          workspaceId,
          config: getDefaultConfig(),
        }
      : {
          new: false as const,
          ...data.integration,
        };

  const methods = useZodForm({
    schema: mutationSchema,
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    methods.reset(getDefaultValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleClose = () => {
    methods.reset();
    onClose();
  };

  const mutationArgs = {
    onSuccess: () => {
      refetchIntegrations();
      handleClose();
    },
  };

  const { mutate: createIntegration } =
    api.workspace.integrations.create.useMutation(mutationArgs);

  const { mutate: updateIntegration } =
    api.workspace.integrations.update.useMutation(mutationArgs);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate form
    const isValid = await methods.trigger();

    if (!isValid) {
      return;
    }

    const values = methods.getValues();

    values.new ? createIntegration(values) : updateIntegration(values);
  };

  const fields = useIntegrationFields(methods);

  return (
    <SideOver
      title={data.new ? "Create Integration" : "Edit Integration"}
      description={INTEGRATIONS_HELP_TEXT}
      show={show}
      onClose={handleClose}
      actionButtonLabel={data.new ? "Create" : "Update"}
      onFormSubmit={handleSubmit}
      tabs={{
        multiple: false,
        body: <BasicForm items={fields} />,
      }}
    />
  );
};

const useIntegrationFields = (
  methods: ReturnType<typeof useZodForm<typeof mutationSchema>>
) => {
  const fields: BasicFormItemProps[] = [
    {
      required: true,
      label: {
        title: "Integration type",
      },
      field: {
        variant: "select",
        options: Object.entries(INTEGRATION_DEFINITIONS).map(
          ([key, definition]) => ({
            value: key,
            label: definition.name,
          })
        ),
        onChange: async (value) => {
          methods.setValue(
            "config",
            getDefaultConfig(value as IntegrationVariant)
          );

          // Force re-render
          await methods.trigger("config");
          methods.clearErrors("config");
        },
        active: methods.getValues("config.type"),
      },
    },
    {
      required: true,
      label: {
        title: "Integration name",
        description:
          'Custom name for the integration, e.g. "Blog helpdesk". This is used to help the AI',
      },
      field: {
        variant: "text",
        register: methods.register("name"),
        error: methods.formState.errors.name,
      },
    },
    {
      label: {
        title: "Description",
        description:
          "Brief description of the integration. This is used by the AI to refine its answers.",
      },
      field: {
        variant: "textarea",
        register: methods.register("description"),
        error: methods.formState.errors.description,
      },
    },
  ];

  const integrationConfig =
    INTEGRATION_DEFINITIONS[methods.getValues("config.type")];

  integrationConfig.fields.forEach((field) => {
    // @ts-expect-error - We know that the field is defined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const error = methods.formState.errors.config?.[field.accessor];

    fields.push({
      required: field.required,
      label: {
        title: field.name,
        description: field.description,
      },
      field: {
        variant: "text",
        register: methods.register(`config.${field.accessor}`),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error: error as FieldError | undefined,
      },
    });
  });

  return fields;
};