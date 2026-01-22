"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    useRequestStore,
    REQUEST_TYPE_LABELS,
    type ResourceRequest,
} from "@/stores/request-store";
import { useUserStore } from "@/stores/user-store";
import {
    CheckCircle2,
    XCircle,
    Clock,
    FileQuestion,
    User,
    Eye,
    EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "pending" | "approved" | "rejected";

export function AdminRequestQueue() {
    const { requests, approveRequest, rejectRequest, getPendingRequests } = useRequestStore();
    const { profile } = useUserStore();

    const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending");
    const [selectedRequest, setSelectedRequest] = useState<ResourceRequest | null>(null);
    const [adminNote, setAdminNote] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter requests
    const filteredRequests = filterStatus === "all"
        ? requests
        : requests.filter((r) => r.status === filterStatus);

    const pendingCount = getPendingRequests().length;

    const handleApprove = async () => {
        if (!selectedRequest || !profile) return;
        setIsProcessing(true);
        approveRequest(selectedRequest.id, profile.id, adminNote || undefined);
        setSelectedRequest(null);
        setAdminNote("");
        setIsProcessing(false);
    };

    const handleReject = async () => {
        if (!selectedRequest || !profile) return;
        setIsProcessing(true);
        rejectRequest(selectedRequest.id, profile.id, adminNote || undefined);
        setSelectedRequest(null);
        setAdminNote("");
        setIsProcessing(false);
    };

    const getStatusBadge = (status: ResourceRequest["status"]) => {
        switch (status) {
            case "pending":
                return (
                    <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                        <Clock className="h-3 w-3" />
                        Pending
                    </Badge>
                );
            case "approved":
                return (
                    <Badge className="gap-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="gap-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </Badge>
                );
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <FileQuestion className="h-5 w-5 text-orange-600" />
                            Resource Requests
                            {pendingCount > 0 && (
                                <Badge className="bg-orange-600 text-white">
                                    {pendingCount} pending
                                </Badge>
                            )}
                        </CardTitle>
                        {/* Filter Tabs */}
                        <div className="flex gap-1 rounded-lg bg-white/80 p-1 dark:bg-zinc-900/80">
                            {(["pending", "approved", "rejected", "all"] as FilterStatus[]).map((status) => (
                                <Button
                                    key={status}
                                    variant={filterStatus === status ? "default" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "text-xs capitalize",
                                        filterStatus === status && "bg-orange-600 hover:bg-orange-700"
                                    )}
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    {filteredRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <FileQuestion className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                            <p className="text-slate-500">No {filterStatus !== "all" ? filterStatus : ""} requests</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-3">
                                {filteredRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedRequest(request)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {request.courseCode}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {REQUEST_TYPE_LABELS[request.requestType]}
                                                    </Badge>
                                                    {getStatusBadge(request.status)}
                                                </div>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                                                    {request.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        {request.isAnonymous ? (
                                                            <>
                                                                <EyeOff className="h-3 w-3" />
                                                                Anonymous (
                                                                <span className="text-amber-600 font-medium">
                                                                    {request.submitterName}
                                                                </span>
                                                                )
                                                            </>
                                                        ) : (
                                                            <>
                                                                <User className="h-3 w-3" />
                                                                {request.submitterName}
                                                            </>
                                                        )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(request.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            {request.status === "pending" && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-green-600 hover:bg-green-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedRequest(request);
                                                        }}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 text-red-600 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedRequest(request);
                                                        }}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>

            {/* Request Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-lg">
                    {selectedRequest && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Badge variant="outline">{selectedRequest.courseCode}</Badge>
                                    {REQUEST_TYPE_LABELS[selectedRequest.requestType]}
                                </DialogTitle>
                                <DialogDescription>
                                    Requested for {selectedRequest.courseName}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Requester Info - Admin always sees identity */}
                                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                                    <p className="text-xs text-slate-500 mb-1">Requester</p>
                                    <div className="flex items-center gap-2">
                                        {selectedRequest.isAnonymous ? (
                                            <>
                                                <EyeOff className="h-4 w-4 text-amber-600" />
                                                <span className="font-medium">{selectedRequest.submitterName}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    Posted anonymously
                                                </Badge>
                                            </>
                                        ) : (
                                            <>
                                                <User className="h-4 w-4 text-slate-500" />
                                                <span className="font-medium">{selectedRequest.submitterName}</span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        ID: {selectedRequest.submittedBy}
                                    </p>
                                </div>

                                {/* Description */}
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Description</p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                        {selectedRequest.description}
                                    </p>
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-slate-500">Status:</p>
                                    {getStatusBadge(selectedRequest.status)}
                                </div>

                                {/* Admin Note (for pending) */}
                                {selectedRequest.status === "pending" && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Admin Note (optional)</p>
                                        <Textarea
                                            value={adminNote}
                                            onChange={(e) => setAdminNote(e.target.value)}
                                            placeholder="Add a note for the requester..."
                                            rows={2}
                                        />
                                    </div>
                                )}

                                {/* Existing Admin Note */}
                                {selectedRequest.adminNote && (
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                                        <p className="text-xs text-slate-500 mb-1">Admin Response</p>
                                        <p className="text-sm">{selectedRequest.adminNote}</p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                {selectedRequest.status === "pending" ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setSelectedRequest(null)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-red-600 hover:bg-red-50"
                                            onClick={handleReject}
                                            disabled={isProcessing}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={handleApprove}
                                            disabled={isProcessing}
                                        >
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Approve
                                        </Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setSelectedRequest(null)}>
                                        Close
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
