<template>
    <div class="flex items-center">
        <input
            type="checkbox"
            class="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
            :id="id"
            :name="name"
            :value="value"
            v-model="checked"
        >
        <label
            :for="id"
            class="ml-2 block text-sm leading-5 text-gray-700"
        >
            {{ label }}
        </label>
    </div>
</template>

<script>
export default {
    props: {
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        label: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            checked: false
        };
    }
};
</script>

<style scoped>
/* Add your custom styles here */
</style>