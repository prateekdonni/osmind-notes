import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { BsPencilSquare } from "react-icons/bs";
import ListGroup from "react-bootstrap/ListGroup";
import { LinkContainer } from "react-router-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import Loader from 'react-loader-spinner';
import "./Home.css";

export default function Home(props) {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(null);
  const [replaceTerm, setReplaceTerm] = useState(null);
  let [viewNotes, setViewNotes] = useState([]);


  useEffect(() => {
    async function onLoad() {
      // API.del("notes", '/notes/undefined');
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        setIsLoading(false);
        setNotes(notes);
        setViewNotes(notes);
      } catch (e) {
        onError(e);
      }
    }

    onLoad();
  }, [isAuthenticated]);

  function loadNotes() {
    setIsLoading(true);
    return API.get("notes", "/notes");
  }

  function saveNote(note, id) {
    return API.put("notes", `/notes/${id}`, {
      body: note
    });
  }

  function renderNotesList(notes) {
    if (searchTerm && replaceTerm) {
      var p = notes.filter(function(note){
        return note.content.replace(searchTerm,replaceTerm);
      });
      viewNotes = p;

    }
    if (searchTerm) {
      var p =  notes.filter(function(note){
        return note.content.includes(searchTerm);
      });
      viewNotes = p;
    }
    
    return (
      <>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ml-2 font-weight-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {viewNotes.map(({ noteId, content, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {content.trim().split("\n")[0]}
              </span>
              <br />
              <span className="text-muted">
                Created: {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        <div className="pt-3">
          <Link to="/login" className="btn btn-info btn-lg mr-3">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault()
    if (searchTerm) {
      var p = notes.filter(function(note){  
        return note.content.includes(searchTerm);
      });
      viewNotes = p;
    }
    if (searchTerm && replaceTerm) {
      var p = notes.filter(function(note){
        if (note.content.includes(searchTerm)){
          var tempNote = note;
          tempNote.content = tempNote.content.replace(searchTerm,replaceTerm);
          saveNote(tempNote, tempNote.noteId);
          return tempNote;
        } else {
          return note;
        }
        
      });
      setViewNotes(p);
      
    }
    
    // props.handleSearch(searchTerm)
  }

  function renderNotes() {
    return (
      <div className="notes">
        <div className="searchbox">
          <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
          <form onSubmit={submit}>
            <label>
              Search:
              <input type="text" name="searchtext" onChange={e => setSearchTerm(e.target.value)}/>
            </label>
            <label>
              Replace:
              <input type="text" name="replacetext" onChange={e => setReplaceTerm(e.target.value)}/>
            </label>
            <input type="submit" value="Submit"/>
          </form>
        </div>
        {isLoading ? 
          <Loader
            class="loadingspinner"
            type="TailSpin"
            color="#00BFFF"
            height={30}
            width={30}
            timeout={3000} //3 secs
          /> : 
          <ListGroup>
            {!isLoading && renderNotesList(notes)}
          </ListGroup>}
      </div>
    );
  }
  
  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
