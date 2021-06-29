import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { universities, students } from "./data.js";

const findIndex = (array, id) => {
  for (let index in array) {
    if (students[index].id == id) {
      return index;
    }
  }
};

const app = express();

const StudentType = new GraphQLObjectType({
  name: "Student",
  description: "Represent a student",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    firstName: { type: GraphQLNonNull(GraphQLString) },
    lastName: { type: GraphQLNonNull(GraphQLString) },
    univID: { type: GraphQLNonNull(GraphQLInt) },
  }),
});
const UniversityType = new GraphQLObjectType({
  name: "University",
  description: "Represent a university",
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLInt) },
    name: { type: GraphQLNonNull(GraphQLString) },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "Query",
  description: "Root query",
  fields: () => ({
    message: {
      type: GraphQLString,
      resolve: () => "Bonjour à tous",
    },
    students: {
      type: GraphQLList(StudentType),
      description: "list of all students",
      resolve: () => students,
    },
    universities: {
      type: GraphQLList(UniversityType),
      description: "list of all universities",
      resolve: () => universities,
    },
    student: {
      type: StudentType,
      description: "Return a single student base on the id",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, args) => {
        return students.find((student) => student.id == args.id);
      },
    },
  }),
});

const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  description: "Root mutation",
  fields: () => ({
    addStudent: {
      type: StudentType,
      description: "adding a student",
      args: {
        firstName: { type: GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLNonNull(GraphQLString) },
        univID: { type: GraphQLNonNull(GraphQLInt) },
      },
      resolve: (parent, { firstName, lastName, univID }) => {
        const id = students.length + 1;
        const student = {
          id,
          firstName,
          lastName,
          univID,
        };
        students.push(student);
        return student;
      },
    },
    deleteStudent: {
      type: GraphQLList(StudentType),
      description: "delete a student",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (parent, { id }) => {
        const studentIndex = findIndex(students, id);
        students.splice(studentIndex, 1);

        return students;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

app.use(
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(5000, () => {
  console.log("the server is running on port 5000");
});
