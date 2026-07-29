import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import PasswordInput from "../../app/components/PasswordInput.vue"

describe("PasswordInput", () => {
  it("toggles password visibility without changing the value", async () => {
    const wrapper = mount(PasswordInput, {
      props: {
        id: "account-password",
        label: "password",
        modelValue: "correct horse battery staple",
      },
    })

    const input = wrapper.get("input")
    const toggle = wrapper.get("button")

    expect(input.attributes("type")).toBe("password")
    expect(input.element.value).toBe("correct horse battery staple")
    expect(toggle.attributes("aria-label")).toBe("Show password")

    await toggle.trigger("click")

    expect(input.attributes("type")).toBe("text")
    expect(input.element.value).toBe("correct horse battery staple")
    expect(toggle.attributes("aria-label")).toBe("Hide password")
  })
})
