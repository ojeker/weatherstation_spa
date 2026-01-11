import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import SparkRow from "@/ui/components/SparkRow.vue";

describe("SparkRow", () => {
  it("displays label", () => {
    const wrapper = mount(SparkRow, {
      props: {
        label: "Temp",
        bars: "▁▂▃▄▅▆▇█",
        summary: "6° → 14°",
      },
    });

    expect(wrapper.text()).toContain("Temp");
  });

  it("displays spark bars", () => {
    const wrapper = mount(SparkRow, {
      props: {
        label: "Temp",
        bars: "▁▂▃▄▅▆▇█",
        summary: "6° → 14°",
      },
    });

    expect(wrapper.text()).toContain("▁▂▃▄▅▆▇█");
  });

  it("displays summary", () => {
    const wrapper = mount(SparkRow, {
      props: {
        label: "Rain",
        bars: "▁▁▁▁▄▆█",
        summary: "2.5mm",
      },
    });

    expect(wrapper.text()).toContain("2.5mm");
  });
});
