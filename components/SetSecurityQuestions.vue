<script lang="ts" setup>
	import { PlusCircle, X } from "lucide-vue-next";

	const props = defineProps<{
		isRecoveringPassword?: boolean;
	}>();

	const availableQuestions = [
		"What was your first pet's name?",
		"In which city were you born?",
		"What was your childhood nickname?",
		"What was your favorite school teacher's name?",
		"What was the make of your first car?",
		"What is your mother's maiden name?",
		"What was the name of your first school?",
		"What is the name of the street you grew up on?",
	];

	const questions = computed(() => {
		return props.isRecoveringPassword ? securityQuestions.value.map(q => q.question) : availableQuestions;
	});

	const securityQuestions = defineModel<Array<{ question: string; answer: string }>>({ default: [] });

	const addSecurityQuestion = () => {
		securityQuestions.value.push({ question: "", answer: "" });
	};

	const removeSecurityQuestion = (index: number) => {
		securityQuestions.value.splice(index, 1);
	};

	const isQuestionSelected = (question: string, index: number) => {
		return securityQuestions.value.some((q, i) => q.question === question && i !== index);
	};
</script>

<template>
	<div class="space-y-4">
		<div v-if="!isRecoveringPassword" class="flex items-center justify-between">
			<h3 class="text-sm font-medium">Security Questions</h3>
			<button
				type="button"
				@click="addSecurityQuestion"
				class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
			>
				<PlusCircle class="h-4 w-4" />
				Add Question
			</button>
		</div>

		<TransitionGroup name="list" tag="div" class="space-y-4">
			<template v-if="questions && questions.length">
				<div
					v-for="(question, index) in securityQuestions"
					:key="index"
					class="space-y-3 bg-gray-50 p-4 rounded-lg relative"
				>
					<div class="space-y-2">
						<label :for="'question-' + index" class="block text-sm font-medium">
							Security Question {{ index + 1 }}
						</label>
						<select
							:id="'question-' + index"
							v-model="question.question"
							required
							class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
						>
							<option value="" disabled>Select a question</option>
							<option v-for="q in questions" :key="q" :value="q" :disabled="isQuestionSelected(q, index)">
								{{ q }}
							</option>
						</select>
					</div>

					<div class="space-y-2">
						<label :for="'answer-' + index" class="block text-sm font-medium"> Answer </label>
						<input
							:id="'answer-' + index"
							v-model="question.answer"
							type="text"
							required
							placeholder="Enter your answer"
							class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
						/>
					</div>

					<button
						v-if="!isRecoveringPassword && securityQuestions.length > 1"
						type="button"
						@click="removeSecurityQuestion(index)"
						class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
					>
						<X class="h-5 w-5" />
					</button>
				</div>
			</template>
		</TransitionGroup>
	</div>
</template>
