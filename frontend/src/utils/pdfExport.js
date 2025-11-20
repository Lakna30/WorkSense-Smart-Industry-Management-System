import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportTasksToPDF = async (tasks, stats) => {
  // Create a temporary container for the PDF content
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px';
  tempContainer.style.backgroundColor = 'white';
  tempContainer.style.padding = '20px';
  tempContainer.style.fontFamily = 'Arial, sans-serif';
  
  // Generate HTML content for PDF
  const htmlContent = generateTasksHTML(tasks, stats);
  tempContainer.innerHTML = htmlContent;
  
  document.body.appendChild(tempContainer);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save PDF
    const fileName = `tasks-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
};

const generateTasksHTML = (tasks, stats) => {
  const currentDate = new Date().toLocaleDateString();
  
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
        <h1 style="color: #dc2626; margin: 0; font-size: 28px;">WorkSense Task Report</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Generated on ${currentDate}</p>
      </div>
      
      <!-- Statistics -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Task Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.total}</div>
            <div style="font-size: 12px; color: #6b7280;">Total Tasks</div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #d97706;">${stats.pending}</div>
            <div style="font-size: 12px; color: #6b7280;">Pending</div>
          </div>
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.completed}</div>
            <div style="font-size: 12px; color: #6b7280;">Completed</div>
          </div>
        </div>
      </div>
      
      <!-- Tasks List -->
      <div>
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Tasks Overview</h2>
        ${tasks.map((task, index) => generateTaskHTML(task, index + 1)).join('')}
      </div>
    </div>
  `;
};

const generateTaskHTML = (task, index) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#059669';
      case 'in_progress': return '#2563eb';
      case 'pending': return '#d97706';
      case 'cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  };
  
  const getChecklistProgress = (checklist) => {
    if (!checklist || checklist.length === 0) return 0;
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };
  
  const progress = getChecklistProgress(task.checklist);
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #fafafa;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #111827;">${index}. ${task.title}</h3>
          ${task.category ? `<p style="margin: 0; font-size: 12px; color: #6b7280;">Category: ${task.category}</p>` : ''}
        </div>
        <div style="display: flex; gap: 10px;">
          <span style="background: ${getStatusColor(task.status)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">
            ${task.status.replace('_', ' ')}
          </span>
          <span style="background: ${getPriorityColor(task.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">
            ${task.priority}
          </span>
        </div>
      </div>
      
      ${task.description ? `<p style="margin: 0 0 15px 0; color: #4b5563; line-height: 1.5;">${task.description}</p>` : ''}
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
        <div>
          <strong style="color: #374151;">Due Date:</strong>
          <span style="color: ${isOverdue ? '#dc2626' : '#6b7280'}; margin-left: 5px;">${dueDate}</span>
        </div>
        <div>
          <strong style="color: #374151;">Created:</strong>
          <span style="color: #6b7280; margin-left: 5px;">${new Date(task.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      ${task.checklist && task.checklist.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #374151;">Checklist Progress:</strong>
            <span style="color: #6b7280; font-size: 14px;">${progress}%</span>
          </div>
          <div style="background: #e5e7eb; border-radius: 4px; height: 8px; overflow: hidden;">
            <div style="background: #dc2626; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 5px;">
            ${task.checklist.filter(item => item.completed).length} of ${task.checklist.length} items completed
          </div>
        </div>
      ` : ''}
      
      ${task.notes ? `
        <div style="background: #f9fafb; padding: 10px; border-radius: 4px; border-left: 3px solid #dc2626;">
          <strong style="color: #374151;">Notes:</strong>
          <p style="margin: 5px 0 0 0; color: #4b5563; font-style: italic;">${task.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
};

// Export assets to PDF
export const exportAssetsToPDF = async (assets, stats) => {
  // Create a temporary container for the PDF content
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px';
  tempContainer.style.backgroundColor = 'white';
  tempContainer.style.padding = '20px';
  tempContainer.style.fontFamily = 'Arial, sans-serif';
  
  // Generate HTML content for PDF
  const htmlContent = generateAssetsHTML(assets, stats);
  tempContainer.innerHTML = htmlContent;
  
  document.body.appendChild(tempContainer);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save PDF
    const fileName = `assets-report-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }
};

const generateAssetsHTML = (assets, stats) => {
  const currentDate = new Date().toLocaleDateString();
  
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
        <h1 style="color: #dc2626; margin: 0; font-size: 28px;">WorkSense Asset Report</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Generated on ${currentDate}</p>
      </div>
      
      <!-- Statistics -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 15px;">Asset Statistics</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.total}</div>
            <div style="font-size: 12px; color: #6b7280;">Total Assets</div>
          </div>
          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.available}</div>
            <div style="font-size: 12px; color: #6b7280;">Available</div>
          </div>
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #d97706;">${stats.rented}</div>
            <div style="font-size: 12px; color: #6b7280;">Rented Out</div>
          </div>
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.maintenance}</div>
            <div style="font-size: 12px; color: #6b7280;">In Maintenance</div>
          </div>
        </div>
      </div>
      
      <!-- Assets List -->
      <div>
        <h2 style="color: #374151; font-size: 20px; margin-bottom: 20px;">Assets Overview</h2>
        ${assets.map((asset, index) => generateAssetHTML(asset, index + 1)).join('')}
      </div>
    </div>
  `;
};

const generateAssetHTML = (asset, index) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#059669';
      case 'rented': return '#d97706';
      case 'maintenance': return '#dc2626';
      default: return '#6b7280';
    }
  };
  
  const getStatusBg = (status) => {
    switch (status) {
      case 'available': return '#d1fae5';
      case 'rented': return '#fef3c7';
      case 'maintenance': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };
  
  const nextMaintenance = asset.next_maintenance ? new Date(asset.next_maintenance).toLocaleDateString() : 'Not scheduled';
  const isOverdue = asset.next_maintenance && new Date(asset.next_maintenance) < new Date() && asset.status !== 'maintenance';
  
  return `
    <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: #fafafa;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #111827;">${index}. ${asset.name}</h3>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Type: ${asset.type}</p>
        </div>
        <div style="display: flex; gap: 10px;">
          <span style="background: ${getStatusBg(asset.status)}; color: ${getStatusColor(asset.status)}; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase;">
            ${asset.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
        <div>
          <strong style="color: #374151;">Location:</strong>
          <span style="color: #6b7280; margin-left: 5px;">${asset.location}</span>
        </div>
        <div>
          <strong style="color: #374151;">Next Maintenance:</strong>
          <span style="color: ${isOverdue ? '#dc2626' : '#6b7280'}; margin-left: 5px;">${nextMaintenance}</span>
        </div>
      </div>
      
      ${asset.status === 'rented' ? `
        <div style="background: #fef3c7; padding: 10px; border-radius: 4px; border-left: 3px solid #d97706; margin-bottom: 15px;">
          <strong style="color: #374151;">Rental Information:</strong>
          <p style="margin: 5px 0 0 0; color: #4b5563;">
            Rented to: ${asset.rented_to || 'Unknown'}<br>
            Until: ${asset.rented_until || 'Unknown'}
          </p>
        </div>
      ` : ''}
      
      ${asset.condition ? `
        <div style="background: #f9fafb; padding: 10px; border-radius: 4px; border-left: 3px solid #dc2626;">
          <strong style="color: #374151;">Condition:</strong>
          <p style="margin: 5px 0 0 0; color: #4b5563;">${asset.condition}</p>
        </div>
      ` : ''}
    </div>
  `;
};