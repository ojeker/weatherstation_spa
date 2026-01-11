import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LoadingSpinner from "@/ui/components/LoadingSpinner.vue";
import ErrorState from "@/ui/components/ErrorState.vue";
import EmptyState from "@/ui/components/EmptyState.vue";

describe("LoadingSpinner", () => {
  it("displays loading message", () => {
    const wrapper = mount(LoadingSpinner);

    expect(wrapper.text()).toContain("Loading");
  });
});

describe("ErrorState", () => {
  it("displays error message", () => {
    const wrapper = mount(ErrorState, {
      props: {
        message: "Network error occurred",
      },
    });

    expect(wrapper.text()).toContain("Network error occurred");
  });

  it("displays retry button", () => {
    const wrapper = mount(ErrorState, {
      props: {
        message: "Error",
      },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Try again");
  });

  it("emits retry event when button clicked", async () => {
    const wrapper = mount(ErrorState, {
      props: {
        message: "Error",
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.emitted("retry")).toBeTruthy();
  });
});

describe("EmptyState", () => {
  it("displays station abbreviation in message", () => {
    const wrapper = mount(EmptyState, {
      props: {
        stationAbbr: "GOE",
      },
    });

    expect(wrapper.text()).toContain("GOE");
    expect(wrapper.text()).toContain("No data available");
  });
});
