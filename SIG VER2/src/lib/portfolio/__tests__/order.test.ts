import { describe, it, expect } from "vitest";
import { sortByOrder, moveItem, renumber } from "../order";

describe("sortByOrder", () => {
  it("puts ordered items first ascending, then unordered by id", () => {
    const items = [
      { id: 3 },
      { id: 1, order: 2 },
      { id: 2, order: 1 },
      { id: 4 },
    ];
    expect(sortByOrder(items).map((i) => i.id)).toEqual([2, 1, 3, 4]);
  });
  it("does not mutate the input", () => {
    const items = [{ id: 2, order: 2 }, { id: 1, order: 1 }];
    sortByOrder(items);
    expect(items.map((i) => i.id)).toEqual([2, 1]);
  });
});

describe("moveItem", () => {
  it("moves down and up", () => {
    expect(moveItem(["a", "b", "c", "d"], 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(["a", "b", "c", "d"], 3, 1)).toEqual(["a", "d", "b", "c"]);
  });
  it("ignores out-of-range or no-op moves", () => {
    expect(moveItem(["a", "b"], 0, 0)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], 0, 5)).toEqual(["a", "b"]);
    expect(moveItem(["a", "b"], -1, 1)).toEqual(["a", "b"]);
  });
});

describe("renumber", () => {
  const items = [
    { id: 1, order: 1, title: "a" },
    { id: 2, order: 2, title: "b" },
    { id: 3, title: "c" },
  ];
  it("assigns 1..n in the given id order", () => {
    const out = renumber(items, [3, 1, 2]);
    expect(out.map((i) => [i.id, i.order])).toEqual([[3, 1], [1, 2], [2, 3]]);
  });
  it("appends items missing from the id list and ignores unknown ids", () => {
    const out = renumber(items, [2, 99]);
    expect(out.map((i) => [i.id, i.order])).toEqual([[2, 1], [1, 2], [3, 3]]);
  });
});
