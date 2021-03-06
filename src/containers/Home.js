import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { BsPencilSquare, BsThreeDots } from "react-icons/bs";
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
  const [replaceVisible, setReplaceVisible] = useState(false);
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
    var p = [];
    if (searchTerm && replaceTerm) {
      p = notes.filter(function(note){
        return note.content.replace(searchTerm,replaceTerm);
      });
      viewNotes = p;

    }
    if (searchTerm) {
      p =  notes.filter(function(note){
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
        {viewNotes.map(({ noteId, content, preview, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {content.trim().split("\n")[0]}
              </span>
              <br />
              {searchTerm &&
              content.substring(
                  content.indexOf(searchTerm)-10,
                  content.indexOf(searchTerm))
             }
             {searchTerm &&
              <span className="text-match">
                {content.substring(
                  content.indexOf(searchTerm),
                  (content.indexOf(searchTerm) + searchTerm.length)
                )}
              </span>}
              {searchTerm &&
              content.substring(
                  content.indexOf(searchTerm)+searchTerm.length,
                  (searchTerm.length + content.indexOf(searchTerm)+10)
              )}
              {searchTerm && <br/>}
              <span>
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

  const handleToggle= (e) => {
    setReplaceVisible(!replaceVisible);
  }

  const submit = (e) => {
    var p = [];
    if (searchTerm) {
      p = notes.filter(function(note){  
        return note.content.includes(searchTerm);
      });
      viewNotes = p;
    }
    if (searchTerm && replaceTerm) {
      p = notes.filter(function(note){
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
        <div className="hdr">
          <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
          <form onSubmit={submit}>
            <div className="searchbox">
              <label className="labelText" >
                Search: 
              </label>
              <input type="text" name="searchtext" onChange={e => setSearchTerm(e.target.value)}/>
              <BsThreeDots onClick={handleToggle}></BsThreeDots> 
              {replaceVisible && <div>
                <label className="labelText" >
                    Replace: 
                </label>  
                <input type="text" name="replacetext" onChange={e => setReplaceTerm(e.target.value)}/>
                <input type="submit" value="Submit"/>
                </div>
              }
              
            </div>
            
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
