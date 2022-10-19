import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { 
  addDoc, 
  collection, 
  deleteDoc, 
  doc, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  query,
  updateDoc } from 'firebase/firestore';
import { db, TODOS_REF } from './firebase/Config';

export default function App() {

  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState({});

  useEffect(() => {
    const q = query(collection(db, TODOS_REF), orderBy('todoItem'))
    onSnapshot(q, (querySnapshot) => {
      setTodos(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))
    })
  }, []);

  const addNewTodo = async() => {
    try {
      if (newTodo.trim() !== "") {
        await addDoc(collection(db, TODOS_REF), {
          done: false,
          todoItem: newTodo
        });
        setNewTodo('');
      }
    }
    catch (error) {
      console.log(error.message);
    }
  }

  const removeTodos = async() => {
    try {
      const querySnapshot = await getDocs(collection(db, TODOS_REF));
      querySnapshot.forEach((todo) => {
        removeTodo(todo.id)
      })
    }
    catch (error) {
      console.log(error.message);
    }
  }
    
  const removeTodo = async(id) => {
    try {
      await deleteDoc(doc(db, TODOS_REF, id));
    }
    catch (error) {
      console.log(error.message);
    }
  }

  const onCheck = async(id, done) => {
    try {
      await updateDoc(doc(db, TODOS_REF, id), {
        done: !done
      })
    }
    catch(error) {
      console.log(error.message);
    }
  };

  const onRemove = async(id) => {
    try {
      await deleteDoc(doc(db, TODOS_REF, id));
    }
    catch(error) {
      console.log(error.message);
    }
  };

  const createTwoButtonAlert = () => Alert.alert(
    "Todolist", "Remove all items?", [{
      text: "Cancel",
      onPress: () => console.log("Cancel Pressed"),
      style: "cancel"
    },
    { 
      text: "OK", onPress: () => removeTodos()
    }],
    { cancelable: false }
  );

  let todosKeys = Object.keys(todos);

  return (
    <View 
      style={styles.container}
      contentContainerStyle={styles.contentContainerStyle}>
      <Text style={styles.header}>Todolist ({todosKeys.length})</Text>
      <View style={styles.newItem}>
        <TextInput
          placeholder='Add new todo'
          value={newTodo}
          style={styles.textInput}
          onChangeText={setNewTodo}
        />
      </View>
      <View style={styles.buttonStyle}>
        <Button 
          title="Add new Todo item"
          onPress={() => addNewTodo()}
        />
      </View>
      <ScrollView>
        {todosKeys.length > 0 ? (
          todosKeys.map(key => (
            <View style={styles.todoItem} key={key}>
              <Pressable onPress={() => onCheck(todos[key].id, todos[key].done)}>
                {todos[key].done
                  ? <MaterialIcons name={'check-box'} size={32} />
                  : <MaterialIcons name={'check-box-outline-blank'} size={32} />}
              </Pressable>
              <Text onPress={() => onCheck(todos[key].id, todos[key].done)}
                style={
                  [styles.todoText, 
                  {backgroundColor: todos[key].done ? "lightgreen" : "lightblue"}]}>{todos[key].todoItem}
              </Text>
              <Pressable>
                <Entypo name={'trash'} size={32} onPress={() => onRemove(todos[key].id)} />
              </Pressable>
            </View>
        ))
        ) : (
          <Text style={styles.infoText}>There are no items</Text>
        )}
        <View style={styles.buttonStyle}>
          <Button 
            title="Remove all todos" 
            onPress={() => createTwoButtonAlert()} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    marginLeft: 30,
    height: '20%',
  },
  contentContainerStyle: {
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 30
  },
  newItem: {
    marginVertical: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 15
  },
  buttonStyle: {
    marginTop: 10,
    marginBottom: 10,
    width: "80%"
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#afafaf',
    width: '80%',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginVertical: 20,
    fontSize: 18
  },
  todoItem: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  todoText: {
    borderColor: '#afafaf',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    marginLeft: 10,
    minWidth: '60%'
  }
});