// todo.js

const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
};

const getDateAfterDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
};

// in-memory storage for orders
const orders = [];

// in-memory storage for todos
const todos = [
    {
        id: 1,
        title: "Buy groceries",
        details: "Buy milk, bread, and eggs",
        dateDue: getDateAfterDays(1),
        priority: "high",
        completed: false,
    },
    {
        id: 2,
        title: "Purchase birthday gift",
        details: "Buy a gift for John's birthday: Harry Potter and the Cursed Child book",
        dateDue: getDateAfterDays(7),
        priority: "medium",
        completed: false,
    },
    {
        id: 3,
        title: "Clean the toilet",
        details: "Clean the toilet with bleach. Need to buy bleach",
        dateDue: getDateAfterDays(2),
        priority: "medium",
        completed: false,
    }
];

const getAllTodos = () => {
    return todos;
};

const findTodosDueWithinDays = (days) => {
    const today = new Date(getTodayDate());
    const endDate = new Date(getDateAfterDays(days));

    return todos.filter(todo => {
        const dueDate = new Date(todo.dateDue);

        return (
            !todo.completed &&
            dueDate >= today &&
            dueDate <= endDate
        );
    });
};

const addTodo = (todo) => {
    const nextId = todos.length > 0
        ? Math.max(...todos.map(t => t.id)) + 1
        : 1;

    const newTodo = {
        id: todo.id ?? nextId,
        title: todo.title,
        details: todo.details ?? "",
        dateDue: todo.dateDue ?? getTodayDate(),
        priority: todo.priority ?? "medium",
        completed: todo.completed ?? false,
    };

    todos.push(newTodo);
    return newTodo;
};

const updateTodo = (todoId, updates) => {
    const todo = todos.find(t => t.id === Number(todoId));

    if (!todo) {
        return null;
    }

    Object.assign(todo, updates);
    return todo;
};

const markTodoCompleted = (todoId) => {
    const todo = todos.find(t => t.id === Number(todoId));

    if (!todo) {
        return null;
    }

    todo.completed = true;
    return todo;
};

// Shape of orderDetails:
// {
//     items: [
//         {
//             name: "Item name",
//             quantity: 1,
//             price: 10.00
//         }
//     ],
//     total: 10.00,
//     date: "2026-06-28",
//     status: "pending"
// }
const placeOrder = (orderDetails) => {
    const nextId = orders.length > 0
        ? Math.max(...orders.map(o => o.id)) + 1
        : 1;

    const items = orderDetails.items ?? [];

    const calculatedTotal = items.reduce((sum, item) => {
        return sum + Number(item.price ?? 0) * Number(item.quantity ?? 1);
    }, 0);

    const newOrder = {
        id: nextId,
        items,
        total: orderDetails.total ?? calculatedTotal,
        date: orderDetails.date ?? getTodayDate(),
        status: orderDetails.status ?? "pending",
    };

    console.log("Order placed:", newOrder);
    orders.push(newOrder);

    return newOrder;
};

const findOrderByItem = (itemName) => {
    const regex = new RegExp(itemName, "i");

    return orders.filter(order => {
        return order.items.some(item => regex.test(item.name));
    });
};

const getAllOrders = () => {
    return orders;
};


module.exports = {
    getTodayDate,
    getDateAfterDays,

    getAllTodos,
    findTodosDueWithinDays,
    addTodo,
    updateTodo,
    markTodoCompleted,

    placeOrder,
    findOrderByItem,    
    getAllOrders,
};