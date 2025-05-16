// Check if form is valid
    const isFormValid = computed(() => {
      return newItem.value.name.trim() !== '' && 
             newItem.value.imageUrl !== '' && 
             newItem.value.details.trim() !== '';
    });
    
    // Handle form submission
    const handleSubmit = () => {
      if (!isFormValid.value) return;
      
      // Create new item with unique ID
      const itemToAdd: Item = {
        ...newItem.value,
        id: Date.now().toString()
      };
      
      // Emit event with new item
      emit('item-added', itemToAdd);
      
      // Reset form
      newItem.value = {
        name: '',
        imageUrl: '',
        details: '',
        status: 'not_sold'
      };
      previewUrl.value = '';
    };
    
    return {
      newItem,
      previewUrl,
      statusOptions,
      isFormValid,
      handleFileChange,
      handleSubmit
    };
  }
});
</script>