<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-10" @close="$emit('close')">
            <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leave-from="translate-x-0" leave-to="translate-x-full">
                        <DialogPanel class="pointer-events-auto relative w-screen max-w-md">
                            <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
                            <div class="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                                <button type="button" class="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white" @click="$emit('close')" >
                                    <span class="absolute -inset-2.5" ></span>
                                    <span class="sr-only">Close panel</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            </TransitionChild>
                            <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                <div class="px-4 sm:px-6">
                                    <DialogTitle class="text-base font-semibold leading-6 text-gray-900">{{ props.panelTitle }}</DialogTitle>
                                </div>
                                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                                    <slot></slot>
                                </div>
                            </div>
                        </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
    isOpen : Boolean,
    panelTitle: String,
})

</script>

<style scoped>

</style>