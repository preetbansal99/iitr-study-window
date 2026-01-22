"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Resource Request Store
 * ======================
 * Manages course resource requests from students
 * Admin can view, approve, or reject requests
 */

export type RequestType = "notes" | "video" | "pyp" | "syllabus" | "clarification";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface ResourceRequest {
    id: string;
    courseCode: string;
    courseName: string;
    requestType: RequestType;
    description: string;
    submittedBy: string; // User ID - always stored even if anonymous
    submitterName: string; // Display name
    isAnonymous: boolean; // UI-level anonymity
    status: RequestStatus;
    adminNote?: string;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
}

interface RequestState {
    requests: ResourceRequest[];
    isLoading: boolean;

    // Actions
    submitRequest: (request: Omit<ResourceRequest, "id" | "status" | "createdAt">) => ResourceRequest;
    approveRequest: (id: string, adminId: string, note?: string) => void;
    rejectRequest: (id: string, adminId: string, note?: string) => void;
    getPendingRequests: () => ResourceRequest[];
    getRequestsForCourse: (courseCode: string) => ResourceRequest[];
    getUserRequests: (userId: string) => ResourceRequest[];
}

function generateId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useRequestStore = create<RequestState>()(
    persist(
        (set, get) => ({
            requests: [],
            isLoading: false,

            submitRequest: (requestData) => {
                const newRequest: ResourceRequest = {
                    ...requestData,
                    id: generateId(),
                    status: "pending",
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    requests: [newRequest, ...state.requests],
                }));

                return newRequest;
            },

            approveRequest: (id, adminId, note) => {
                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === id
                            ? {
                                ...req,
                                status: "approved" as RequestStatus,
                                adminNote: note,
                                resolvedAt: new Date().toISOString(),
                                resolvedBy: adminId,
                            }
                            : req
                    ),
                }));
            },

            rejectRequest: (id, adminId, note) => {
                set((state) => ({
                    requests: state.requests.map((req) =>
                        req.id === id
                            ? {
                                ...req,
                                status: "rejected" as RequestStatus,
                                adminNote: note,
                                resolvedAt: new Date().toISOString(),
                                resolvedBy: adminId,
                            }
                            : req
                    ),
                }));
            },

            getPendingRequests: () => {
                return get().requests.filter((req) => req.status === "pending");
            },

            getRequestsForCourse: (courseCode) => {
                return get().requests.filter((req) => req.courseCode === courseCode);
            },

            getUserRequests: (userId) => {
                return get().requests.filter((req) => req.submittedBy === userId);
            },
        }),
        {
            name: "resource-requests-storage",
        }
    )
);

// Request type labels for UI
export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
    notes: "Lecture Notes",
    video: "Video Tutorial",
    pyp: "Previous Year Papers",
    syllabus: "Syllabus Addition",
    clarification: "Clarification",
};
