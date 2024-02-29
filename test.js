const data = [
  { cls: "5", text: "препараты фармацевтические для человека" },
  { cls: "5", text: "факторы свертывания крови человека" },
  { cls: "16", text: "плакаты пешие (носимые человеком)" },
  { cls: "29", text: "клюква сушеная для потребления человеком" },
  { cls: "29", text: "ножки утиные для употребления человеком" },
];

const groupedData = data.reduce((acc, obj) => {
  const { cls, text } = obj;
  if (!acc[cls]) {
    acc[cls] = { cls, text: [text] };
  } else {
    acc[cls].text.push(text);
  }
  return acc;
}, {});

const result = Object.values(groupedData);

console.log(groupedData);
