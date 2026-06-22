import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactForm } from "@/app/(marketing)/contact/ContactForm";

describe("ContactForm", () => {
  it("renders email field and submit button", () => {
    render(<ContactForm />);
    expect(screen.getByPlaceholderText(/work email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });
});
