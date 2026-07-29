import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import TagChip from "../../app/components/TagChip.vue"

describe("TagChip", () => {
  it("exposes its active state and emits a click", async () => {
    const wrapper = mount(TagChip, { props: { label: "Engineering", active: true } })
    expect(wrapper.text()).toContain("Engineering")
    expect(wrapper.classes()).toContain("tag-chip--active")

    await wrapper.trigger("click")
    expect(wrapper.emitted("click")).toHaveLength(1)
  })
})
