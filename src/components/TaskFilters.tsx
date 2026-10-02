import { Search, SlidersHorizontal, X } from "lucide-react";

export type SortOption = "NEWEST" | "OLDEST" | "DUE_DATE" | "PRIORITY";

interface TaskFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  onClear: () => void;
  isActive: boolean;
}

export default function TaskFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  onClear,
  isActive,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 mb-6 p-4 bg-surface border border-border rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="block w-full pl-9 pr-3 py-2 border border-border rounded-md leading-5 bg-input text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="statusFilter" className="sr-only">Status</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-border rounded-md bg-input text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px]"
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="priorityFilter" className="sr-only">Priority</label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="pl-3 pr-8 py-2 border border-border rounded-md bg-input text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px]"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-text-muted hidden sm:block" />
            <label htmlFor="sortBy" className="sr-only">Sort By</label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-3 pr-8 py-2 border border-border rounded-md bg-input text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-[13px]"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="DUE_DATE">Due Date</option>
              <option value="PRIORITY">Priority</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isActive && (
            <button
              onClick={onClear}
              aria-label="Clear filters"
              className="inline-flex items-center justify-center p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md focus:outline-none transition-colors"
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
