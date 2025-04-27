import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown, ChevronUp } from "lucide-react";

function Accordion({ 
  title, 
  children, 
  className, 
  maxHeight = 300,
  defaultExpanded = false,
  expanded,
  onToggle
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  const isExpanded = expanded !== undefined ? expanded : internalExpanded;
  
  const [contentMaxHeight, setContentMaxHeight] = useState(isExpanded ? 'auto' : '0px');
  const contentRef = useRef(null);

  const toggleAccordion = () => {
    if (onToggle) {
      onToggle(!isExpanded);
    }
    
    if (expanded === undefined) {
      setInternalExpanded(!internalExpanded);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      const contentHeight = contentRef.current.scrollHeight;
      
      setContentMaxHeight(
        contentHeight > maxHeight 
          ? `${maxHeight}px` 
          : `${contentHeight}px`
      );
    } else {
      setContentMaxHeight('0px');
    }
  }, [isExpanded, maxHeight]);

  useEffect(() => {
    if (expanded === undefined) {
      setInternalExpanded(defaultExpanded);
    }
  }, [defaultExpanded, expanded]);

  return (
    <div className={`accordion ${className || ''}`}>
      <div className="accordion-header" onClick={toggleAccordion}>
        <div className="accordion-title">{title}</div>
        <button type="button" className="toggle-btn">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      <div 
        className={`accordion-content ${isExpanded ? 'expanded' : ''}`} 
        ref={contentRef}
        style={{ 
          maxHeight: contentMaxHeight,
          overflow: contentMaxHeight === `${maxHeight}px` ? 'auto' : 'hidden'
        }}
      >
        <div className="content-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  maxHeight: PropTypes.number,
  defaultExpanded: PropTypes.bool,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func
};

export default Accordion; 