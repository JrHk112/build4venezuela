"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ProjectFormError,
  projectQueryKeys,
  saveProject,
} from "@/lib/projects/queries";
import type { ProjectFormState } from "@/lib/projects/schema";

type ProjectFormProps = {
  initialState: ProjectFormState;
  projectId?: string;
  submitLabel: string;
};

const projectFormFields = [
  "slug",
  "name",
  "projectUrl",
  "countries",
  "participantName",
  "videoUrl",
  "descriptionMarkdown",
] as const;

type ProjectFormField = (typeof projectFormFields)[number];
type ProjectFormValues = Record<ProjectFormField, string>;

function projectFormValuesFromState(
  values: ProjectFormState["values"],
): ProjectFormValues {
  return Object.fromEntries(
    projectFormFields.map((field) => [field, values[field] ?? ""]),
  ) as ProjectFormValues;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-2 text-destructive text-xs uppercase tracking-[0.16em]">
      {message}
    </p>
  );
}

export function ProjectForm({
  initialState,
  projectId,
  submitLabel,
}: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [values, setValues] = useState(() =>
    projectFormValuesFromState(initialState.values),
  );
  const [errors, setErrors] = useState(initialState.errors);
  const projectMutation = useMutation({
    mutationFn: saveProject,
    onError: (error: Error) => {
      if (error instanceof ProjectFormError) {
        setValues(projectFormValuesFromState(error.values));
        setErrors(error.errors);
        return;
      }

      setErrors({ form: error.message });
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.list() });
      router.push(`/p/${project.slug}`);
    },
  });

  function handleValueChange(field: ProjectFormField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setErrors((currentErrors) => {
        const {
          [field]: _fieldError,
          form: _formError,
          ...nextErrors
        } = currentErrors;
        return nextErrors;
      });
    };
  }

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    projectMutation.mutate({ projectId, values });
  }

  return (
    <form className="grid gap-6" onSubmit={submitProject}>
      {errors.form ? (
        <div className="border border-destructive bg-destructive/10 p-4 font-mono text-sm uppercase tracking-[0.12em] text-destructive">
          {errors.form}
        </div>
      ) : null}

      <label className="grid gap-2" htmlFor="project-slug">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Project slug
        </span>
        <Input
          id="project-slug"
          name="slug"
          onChange={handleValueChange("slug")}
          placeholder="cool-slug"
          required
          value={values.slug}
        />
        <FieldError message={errors.slug} />
      </label>

      <label className="grid gap-2" htmlFor="project-name">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Project name
        </span>
        <Input
          id="project-name"
          name="name"
          onChange={handleValueChange("name")}
          required
          value={values.name}
        />
        <FieldError message={errors.name} />
      </label>

      <label className="grid gap-2" htmlFor="project-url">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Project link
        </span>
        <Input
          id="project-url"
          name="projectUrl"
          onChange={handleValueChange("projectUrl")}
          placeholder="https://..."
          required
          type="url"
          value={values.projectUrl}
        />
        <FieldError message={errors.projectUrl} />
      </label>

      <label className="grid gap-2" htmlFor="project-countries">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Participant countries
        </span>
        <Input
          id="project-countries"
          name="countries"
          onChange={handleValueChange("countries")}
          placeholder="Venezuela, Colombia, United States"
          required
          value={values.countries}
        />
        <FieldError message={errors.countries} />
      </label>

      <label className="grid gap-2" htmlFor="project-participant-name">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Team or participant name
        </span>
        <Input
          id="project-participant-name"
          name="participantName"
          onChange={handleValueChange("participantName")}
          required
          value={values.participantName}
        />
        <FieldError message={errors.participantName} />
      </label>

      <label className="grid gap-2" htmlFor="project-video-url">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Demo video link (optional)
        </span>
        <Input
          id="project-video-url"
          name="videoUrl"
          onChange={handleValueChange("videoUrl")}
          placeholder="https://youtu.be/..."
          type="url"
          value={values.videoUrl}
        />
        <FieldError message={errors.videoUrl} />
      </label>

      <label className="grid gap-2" htmlFor="project-description">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Markdown description
        </span>
        <Textarea
          className="min-h-64 text-sm leading-6"
          id="project-description"
          name="descriptionMarkdown"
          onChange={handleValueChange("descriptionMarkdown")}
          placeholder={
            "## What did you build?\n\nWho is it for? How does it help? What should people try first?"
          }
          required
          value={values.descriptionMarkdown}
        />
        <FieldError message={errors.descriptionMarkdown} />
      </label>

      <Button
        className="h-12 text-sm uppercase tracking-[0.18em]"
        disabled={projectMutation.isPending}
        type="submit"
      >
        {projectMutation.isPending ? "Checking..." : submitLabel}
      </Button>
    </form>
  );
}
