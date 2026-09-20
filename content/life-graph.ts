export type LifePoint = {
  id: string;
  year: number;
  label: string;
  value: number;
  note: string;
  photo?: string;
};

export const lifeGraphData: LifePoint[] = [
  {
    id: "point-1",
    year: 2001,
    label: "여기에 사건 이름",
    value: 0,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-2",
    year: 2004,
    label: "여기에 사건 이름",
    value: 35,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-3",
    year: 2009,
    label: "여기에 사건 이름",
    value: -45,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-4",
    year: 2013,
    label: "여기에 사건 이름",
    value: 60,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-5",
    year: 2016,
    label: "여기에 사건 이름",
    value: -70,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-6",
    year: 2019,
    label: "여기에 사건 이름",
    value: 20,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-7",
    year: 2021,
    label: "여기에 사건 이름",
    value: -30,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-8",
    year: 2023,
    label: "여기에 사건 이름",
    value: 55,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
  {
    id: "point-9",
    year: 2026,
    label: "여기에 사건 이름",
    value: 10,
    note: "여기에 한두 문장으로 그때 있었던 일을 적는다.",
  },
];
