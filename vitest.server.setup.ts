import { vi, beforeEach } from "vitest";

// Mock the database to use the transactional testing wrapper
vi.mock("~/server/db");

// Mock the auth module
vi.mock("~/server/auth", () => ({
  auth: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});
