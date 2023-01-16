export const place = {
  name: "place",
  description: "place structure",
  options: [
    {
      name: "stlmnt",
      description: "place settlement",
      type: 1,
      options: [
        {
          name: "ind",
          description: "map terrain index",
          type: 4,
          required: true,
        },
      ],
    },

    {
      name: "city",
      description: "place city",
      type: 1,
      options: [
        {
          name: "ind",
          description: "map terrain index",
          type: 4,
          required: true,
        },
      ],
    },

    {
      name: "road",
      description: "place road",
      type: 1,
      options: [
        {
          name: "ind1",
          description: "from intersection index",
          type: 4,
          required: true,
        },
        {
          name: "ind2",
          description: "to intersection index",
          type: 4,
          required: true,
        },
      ],
    },

  ],
};
